const MAX_USER_ATTEMPTS = 200;
const MAX_GLOBAL_ATTEMPTS = 2000;
const MAX_USER_SKIPS = 200;
const MAX_GLOBAL_SKIPS = 1000;

export const mem = {
  attempts: [],
  reports: new Map(),
  users: new Map(),
  seen: new Map(),
  skips: [],
};

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
  return mem.users.get(id);
}

function ensureSeenSet(userId) {
  const id = String(userId || 'dev');
  if (!mem.seen.has(id)) {
    mem.seen.set(id, new Set());
  }
  return mem.seen.get(id);
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
  const uid = String(userId || 'dev');
  const iid = String(itemId || '');
  const safeMode = String(mode || 'why');
  const ts = Date.now();
  const record = {
    userId: uid,
    itemId: iid,
    mode: safeMode,
    score: clampScore(Number(score ?? 0)),
    rubric: normalizeRubric(rubric),
    spans: normalizeSpans(spans),
    correctSequence: normalizeSequence(correctSequence),
    fixSuggestion: fixSuggestion ? String(fixSuggestion) : null,
    nextHints: normalizeHints(nextHints),
    details: safeDetails(details),
    ts,
    gradedAt: gradedAt || new Date(ts).toISOString(),
  };

  mem.attempts.push(record);
  if (mem.attempts.length > MAX_GLOBAL_ATTEMPTS) {
    mem.attempts.splice(0, mem.attempts.length - MAX_GLOBAL_ATTEMPTS);
  }

  const user = ensureUser(uid);
  user.attempts.unshift(record);
  if (user.attempts.length > MAX_USER_ATTEMPTS) {
    user.attempts.splice(MAX_USER_ATTEMPTS);
  }

  ensureSeenSet(uid).add(iid);
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
  user.totalExp += award;
  user.level = computeLevel(user.totalExp);

  const skills = Array.isArray(skillIds) ? skillIds.map((id) => String(id)).filter(Boolean) : [];
  for (const skillId of skills) {
    const current = user.skills.get(skillId) || { exp: 0, level: 1 };
    current.exp += award;
    current.level = computeLevel(current.exp);
    user.skills.set(skillId, current);
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
  if (memo) {
    mem.reports.set(id, memo);
  }
  return memo;
}

export function getLatestReport(userId) {
  const id = String(userId || 'dev');
  return mem.reports.get(id) || null;
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
