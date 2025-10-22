import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const { promises: fsPromises } = fs;

const MAX_USER_ATTEMPTS = 200;
const MAX_GLOBAL_ATTEMPTS = 2000;
const MAX_USER_SKIPS = 200;
const MAX_GLOBAL_SKIPS = 1000;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, 'data');
const ATTEMPTS_FILE = path.join(DATA_DIR, 'attempts.jsonl');
const MASTERY_FILE = path.join(DATA_DIR, 'mastery.json');
const REPORTS_FILE = path.join(DATA_DIR, 'reports.json');
const FLUSH_INTERVAL_MS = 3000;

export const mem = {
  attempts: [],
  reports: new Map(),
  users: new Map(),
  seen: new Map(),
  skips: [],
};

let masteryDirty = false;
let reportsDirty = false;

const clampScore = (value) => {
  if (!Number.isFinite(value)) return 0;
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
};

const normalizeRubric = (rubric) => {
  if (!Array.isArray(rubric)) return [];
  return rubric.map((entry) => String(entry || '')).filter(Boolean);
};

const normalizeHints = (hints) => {
  if (!Array.isArray(hints)) return [];
  return hints.map((hint) => String(hint || '')).filter(Boolean);
};

const normalizeSequence = (sequence) => {
  if (!Array.isArray(sequence)) return [];
  return sequence.map((entry) => String(entry || '')).filter(Boolean);
};

const normalizeSpans = (spans) => {
  if (!Array.isArray(spans)) return [];
  return spans
    .map((span) => {
      const start = Number(span?.start ?? span?.[0]);
      const end = Number(span?.end ?? span?.[1]);
      if (!Number.isFinite(start) || !Number.isFinite(end)) return null;
      const a = Math.max(0, Math.min(start, end));
      const b = Math.max(0, Math.max(start, end));
      if (b <= a) return null;
      return { start: a, end: b };
    })
    .filter(Boolean);
};

const safeDetails = (details) => {
  if (details && typeof details === 'object' && !Array.isArray(details)) {
    return { ...details };
  }
  return {};
};

const computeLevel = (exp) => Math.floor(exp / 100) + 1;

const BADGE_PAIRS = [
  ['Beat Detective', 'Comma Tamer'],
  ['Cadence Keeper', 'Image Wrangler'],
  ['Rhythm Wrangler', 'Heat Seeker'],
  ['Plot Architect', 'Voice Sculpter'],
  ['Tempo Fencer', 'Pivot Hunter'],
];

function badgesForLevel(level) {
  if (level <= 1) return [];
  const index = (level - 2) % BADGE_PAIRS.length;
  const pair = BADGE_PAIRS[index] || BADGE_PAIRS[0];
  return pair.slice();
}

function normalizeAttemptRecord(raw = {}) {
  const tsValue = Number(raw.ts);
  const ts = Number.isFinite(tsValue) ? tsValue : Date.now();
  const gradedAt = raw.gradedAt ? String(raw.gradedAt) : new Date(ts).toISOString();
  return {
    userId: String(raw.userId || 'dev'),
    itemId: String(raw.itemId || ''),
    mode: String(raw.mode || 'why'),
    score: clampScore(Number(raw.score ?? 0)),
    rubric: normalizeRubric(raw.rubric),
    spans: normalizeSpans(raw.spans),
    correctSequence: normalizeSequence(raw.correctSequence),
    fixSuggestion: raw.fixSuggestion != null ? String(raw.fixSuggestion) : null,
    nextHints: normalizeHints(raw.nextHints),
    details: safeDetails(raw.details),
    ts,
    gradedAt,
  };
}

function ensureUser(userId) {
  const id = String(userId || 'dev');
  if (!mem.users.has(id)) {
    mem.users.set(id, {
      totalExp: 0,
      level: 1,
      lastLevelAck: 1,
      skills: new Map(),
      attempts: [],
      skips: [],
      badgeHistory: [],
    });
  }
  const user = mem.users.get(id);
  if (!(user.skills instanceof Map)) {
    user.skills = new Map();
  }
  if (!Array.isArray(user.attempts)) {
    user.attempts = [];
  }
  if (!Array.isArray(user.skips)) {
    user.skips = [];
  }
  if (!Array.isArray(user.badgeHistory)) {
    user.badgeHistory = [];
  }
  return user;
}

function ensureSeenSet(userId) {
  const id = String(userId || 'dev');
  if (!mem.seen.has(id)) {
    mem.seen.set(id, new Set());
  }
  return mem.seen.get(id);
}

function safeEnsureDataDir() {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (err) {
    console.warn('[db] Failed to ensure data directory', err?.message || err);
  }
}

function loadMastery() {
  try {
    if (!fs.existsSync(MASTERY_FILE)) return;
    const raw = fs.readFileSync(MASTERY_FILE, 'utf8');
    if (!raw.trim()) return;
    const parsed = JSON.parse(raw);
    const users = parsed?.users;
    if (!users || typeof users !== 'object') return;
    for (const [userId, info] of Object.entries(users)) {
      const user = ensureUser(userId);
      const totalExp = Number(info?.totalExp ?? 0);
      user.totalExp = Number.isFinite(totalExp) ? totalExp : 0;
      const storedLevel = Number(info?.level ?? computeLevel(user.totalExp));
      user.level = Number.isFinite(storedLevel) ? storedLevel : computeLevel(user.totalExp);
      user.lastLevelAck = Math.max(1, Number(info?.lastLevelAck ?? user.level ?? 1));
      if (!(user.skills instanceof Map)) {
        user.skills = new Map();
      }
      user.skills.clear();
      const skills = info?.skills && typeof info.skills === 'object' ? info.skills : {};
      for (const [skillId, skillInfo] of Object.entries(skills)) {
        const exp = Number(skillInfo?.exp ?? 0);
        const level = Number(skillInfo?.level ?? computeLevel(exp));
        user.skills.set(skillId, {
          exp: Number.isFinite(exp) ? exp : 0,
          level: Number.isFinite(level) ? level : computeLevel(Number.isFinite(exp) ? exp : 0),
        });
      }
    }
  } catch (err) {
    console.warn('[db] Failed to load mastery.json', err?.message || err);
  }
}

function loadReports() {
  try {
    mem.reports.clear();
    if (!fs.existsSync(REPORTS_FILE)) return;
    const raw = fs.readFileSync(REPORTS_FILE, 'utf8');
    if (!raw.trim()) return;
    const parsed = JSON.parse(raw);
    const users = parsed?.users;
    if (!users || typeof users !== 'object') return;
    for (const [userId, info] of Object.entries(users)) {
      if (!info || typeof info !== 'object') continue;
      const latest = info.latest ?? null;
      const history = Array.isArray(info.history) ? info.history.slice() : [];
      if (latest || history.length) {
        mem.reports.set(userId, { latest, history });
      }
    }
  } catch (err) {
    console.warn('[db] Failed to load reports.json', err?.message || err);
  }
}

function loadAttempts() {
  try {
    mem.attempts.length = 0;
    mem.seen.clear();
    for (const user of mem.users.values()) {
      if (Array.isArray(user.attempts)) {
        user.attempts.length = 0;
      } else {
        user.attempts = [];
      }
    }

    if (!fs.existsSync(ATTEMPTS_FILE)) return;
    const raw = fs.readFileSync(ATTEMPTS_FILE, 'utf8');
    if (!raw.trim()) return;
    const lines = raw.split(/\r?\n/);
    const parsed = [];
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      try {
        const json = JSON.parse(trimmed);
        parsed.push(normalizeAttemptRecord(json));
      } catch (err) {
        console.warn('[db] Skipped invalid attempt record', err?.message || err);
      }
    }
    if (!parsed.length) return;

    const recent = parsed.slice(-MAX_GLOBAL_ATTEMPTS);
    mem.attempts.push(...recent);

    const perUser = new Map();
    for (const record of recent) {
      const uid = String(record.userId || 'dev');
      ensureUser(uid);
      if (record.itemId) {
        ensureSeenSet(uid).add(record.itemId);
      } else {
        ensureSeenSet(uid);
      }
      if (!perUser.has(uid)) {
        perUser.set(uid, []);
      }
      perUser.get(uid).push(record);
    }

    for (const [uid, records] of perUser.entries()) {
      records.sort((a, b) => (b.ts ?? 0) - (a.ts ?? 0));
      const user = ensureUser(uid);
      user.attempts.length = 0;
      user.attempts.push(...records.slice(0, MAX_USER_ATTEMPTS));
    }
  } catch (err) {
    console.warn('[db] Failed to load attempts.jsonl', err?.message || err);
  }
}

function initStorage() {
  safeEnsureDataDir();
  loadMastery();
  loadReports();
  loadAttempts();
}

function writeFileAtomicSync(filePath, contents) {
  const tmpPath = `${filePath}.tmp`;
  try {
    safeEnsureDataDir();
    fs.writeFileSync(tmpPath, contents);
    fs.renameSync(tmpPath, filePath);
  } catch (err) {
    try {
      if (fs.existsSync(tmpPath)) {
        fs.unlinkSync(tmpPath);
      }
    } catch (cleanupErr) {
      console.warn('[db] Failed to clean up temp file', cleanupErr?.message || cleanupErr);
    }
    throw err;
  }
}

function flushMasterySync() {
  if (!masteryDirty) return;
  const payload = { users: {} };
  for (const [userId, user] of mem.users.entries()) {
    const skills = {};
    if (user.skills instanceof Map) {
      for (const [skillId, data] of user.skills.entries()) {
        const exp = Number(data?.exp ?? 0);
        const level = Number(data?.level ?? computeLevel(exp));
        skills[skillId] = {
          exp: Number.isFinite(exp) ? exp : 0,
          level: Number.isFinite(level) ? level : computeLevel(Number.isFinite(exp) ? exp : 0),
        };
      }
    }
    payload.users[userId] = {
      totalExp: Number.isFinite(Number(user.totalExp)) ? Number(user.totalExp) : 0,
      level: Number.isFinite(Number(user.level)) ? Number(user.level) : computeLevel(Number(user.totalExp) || 0),
      skills,
    };
  }
  try {
    writeFileAtomicSync(MASTERY_FILE, `${JSON.stringify(payload, null, 2)}\n`);
    masteryDirty = false;
  } catch (err) {
    console.warn('[db] Failed to write mastery.json', err?.message || err);
  }
}

function flushReportsSync() {
  if (!reportsDirty) return;
  const payload = { users: {} };
  for (const [userId, data] of mem.reports.entries()) {
    const latest = data?.latest ?? null;
    const history = Array.isArray(data?.history) ? data.history.slice() : [];
    payload.users[userId] = { latest, history };
  }
  try {
    writeFileAtomicSync(REPORTS_FILE, `${JSON.stringify(payload, null, 2)}\n`);
    reportsDirty = false;
  } catch (err) {
    console.warn('[db] Failed to write reports.json', err?.message || err);
  }
}

function flushDirty() {
  flushMasterySync();
  flushReportsSync();
}

initStorage();

const flushTimer = setInterval(() => {
  try {
    flushDirty();
  } catch (err) {
    console.warn('[db] Flush interval warning', err?.message || err);
  }
}, FLUSH_INTERVAL_MS);
if (typeof flushTimer.unref === 'function') {
  flushTimer.unref();
}

export function recordAttempt({
  userId,
  itemId,
  mode,
  score,
  rubric,
  spans,
  correctSequence,
  fixSuggestion,
  nextHints,
  details,
  gradedAt,
} = {}) {
  const ts = Date.now();
  const record = normalizeAttemptRecord({
    userId,
    itemId,
    mode,
    score,
    rubric,
    spans,
    correctSequence,
    fixSuggestion,
    nextHints,
    details,
    ts,
    gradedAt: gradedAt || new Date(ts).toISOString(),
  });

  mem.attempts.push(record);
  if (mem.attempts.length > MAX_GLOBAL_ATTEMPTS) {
    mem.attempts.splice(0, mem.attempts.length - MAX_GLOBAL_ATTEMPTS);
  }

  const user = ensureUser(record.userId);
  user.attempts.unshift(record);
  if (user.attempts.length > MAX_USER_ATTEMPTS) {
    user.attempts.splice(MAX_USER_ATTEMPTS);
  }

  if (record.itemId) {
    ensureSeenSet(record.userId).add(record.itemId);
  } else {
    ensureSeenSet(record.userId);
  }

  fsPromises.appendFile(ATTEMPTS_FILE, `${JSON.stringify(record)}\n`).catch((err) => {
    console.warn('[db] Failed to append attempt', err?.message || err);
  });

  return record;
}

export function getAttempts(userId, { limit = 50 } = {}) {
  const user = ensureUser(userId);
  if (!user.attempts.length) return [];
  const slice = user.attempts.slice(0, Math.max(0, limit));
  return slice.map((attempt) => ({ ...attempt, details: safeDetails(attempt.details) }));
}

export function addExp(userId, skillIds = [], exp = 0) {
  const user = ensureUser(userId);
  const award = Number.isFinite(exp) ? Math.max(0, Math.round(exp)) : 0;
  if (award > 0) {
    user.totalExp += award;
    user.level = computeLevel(user.totalExp);
  }

  const skills = Array.isArray(skillIds) ? skillIds.map((id) => String(id)).filter(Boolean) : [];
  for (const skillId of skills) {
    const current = user.skills.get(skillId) || { exp: 0, level: 1 };
    current.exp += award;
    current.level = computeLevel(current.exp);
    user.skills.set(skillId, current);
  }

  if (award > 0 || skills.length) {
    masteryDirty = true;
  }

  return { totalExp: user.totalExp, level: user.level };
}

export function getMastery(userId) {
  const user = ensureUser(userId);
  const skills = {};
  for (const [skillId, data] of user.skills.entries()) {
    skills[skillId] = { exp: data.exp, level: data.level };
  }
  return {
    totalExp: user.totalExp,
    level: user.level,
    skills,
  };
}

export function checkLevelUp(userId) {
  const user = ensureUser(userId);
  const previous = user.lastLevelAck ?? user.level;
  const leveledUp = user.level > previous;
  if (!leveledUp) {
    return { leveledUp: false, level: user.level, badges: [] };
  }

  const badges = [];
  for (let level = previous + 1; level <= user.level; level += 1) {
    badges.push(...badgesForLevel(level));
  }

  user.lastLevelAck = user.level;
  user.badgeHistory.push(...badges);

  return { leveledUp: true, level: user.level, badges };
}

export function saveReport(userId, memoObject) {
  const id = String(userId || 'dev');
  const memo = memoObject ? { ...memoObject } : null;
  if (!memo) {
    return memo;
  }

  const existing = mem.reports.get(id);
  const history = Array.isArray(existing?.history) ? existing.history.slice() : [];
  if (existing?.latest) {
    history.unshift(existing.latest);
  }
  mem.reports.set(id, { latest: memo, history });
  reportsDirty = true;
  return memo;
}

export function getLatestReport(userId) {
  const id = String(userId || 'dev');
  const entry = mem.reports.get(id);
  return entry?.latest || null;
}

export function markSkipped(userId, itemId, { mode, reason } = {}) {
  const uid = String(userId || 'dev');
  const iid = String(itemId || '');
  const entry = {
    userId: uid,
    itemId: iid,
    mode: mode ? String(mode) : undefined,
    reason: reason ? String(reason) : 'user_skip',
    ts: Date.now(),
  };

  mem.skips.push(entry);
  if (mem.skips.length > MAX_GLOBAL_SKIPS) {
    mem.skips.splice(0, mem.skips.length - MAX_GLOBAL_SKIPS);
  }

  const user = ensureUser(uid);
  user.skips.unshift(entry);
  if (user.skips.length > MAX_USER_SKIPS) {
    user.skips.splice(MAX_USER_SKIPS);
  }

  ensureSeenSet(uid).add(iid);
  return entry;
}

export function userSeenSet(userId) {
  const set = ensureSeenSet(userId);
  return new Set(set);
}

export function _flushNow() {
  try {
    flushDirty();
  } catch (err) {
    console.warn('[db] Manual flush warning', err?.message || err);
  }
}
