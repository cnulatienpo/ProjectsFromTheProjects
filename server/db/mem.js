// server/db/mem.js (ESM)
// In-memory store with disk persistence for attempts, mastery, items, and skips.

import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'server', 'db', 'data');
const ATTEMPTS_FILE = path.join(DATA_DIR, 'attempts.jsonl');
const MASTERY_FILE  = path.join(DATA_DIR, 'mastery.json');
const SKIPS_FILE    = path.join(DATA_DIR, 'skips.jsonl');

// Create data dir if missing
export function ensureDataDir() {
  try { fs.mkdirSync(DATA_DIR, { recursive: true }); } catch {}
}
ensureDataDir();

// --- In-memory state ---
const state = {
  users: new Map(),       // userId -> { unlockedBeats: Set<string>, ... }
  mastery: new Map(),     // userId -> { [skillId]: { level, exp, lastSeen } }
  attempts: new Map(),    // userId -> Array<{...attempt}>
  itemsIndex: new Map(),  // itemId -> item (optional, filled by loaders)
  // Skip cooldown: track recent skips per (userId,itemId)
  skips: new Map(),       // key `${userId}::${itemId}` -> { count, last, avoidUntilPick }
  // Simple rolling "next pick count" for cooldown
  pickTick: new Map(),    // userId -> integer increments each /api/next call
};

// --- Helpers ---
const toArray = (x) => Array.isArray(x) ? x : (x == null ? [] : [x]);
const now = () => Date.now();
const keyFor = (u, i) => `${u}::${i}`;

// --- Persistence: load on boot ---
function loadJson(file, fallback) {
  try {
    const txt = fs.readFileSync(file, 'utf8');
    return JSON.parse(txt);
  } catch { return fallback; }
}

function* readJsonl(file) {
  try {
    const txt = fs.readFileSync(file, 'utf8');
    for (const line of txt.split(/\r?\n/)) {
      const s = line.trim();
      if (!s) continue;
      try { yield JSON.parse(s); } catch {}
    }
  } catch {}
}

export function bootLoad() {
  // mastery snapshot
  const m = loadJson(MASTERY_FILE, {});
  for (const [userId, bucket] of Object.entries(m)) {
    state.mastery.set(userId, bucket);
  }
  // attempts log
  for (const rec of readJsonl(ATTEMPTS_FILE)) {
    const arr = state.attempts.get(rec.userId) || [];
    arr.push(rec);
    state.attempts.set(rec.userId, arr);
  }
  // skips log (best-effort warming; does not rebuild cooldown windows—optional)
  for (const rec of readJsonl(SKIPS_FILE)) {
    const k = keyFor(rec.userId, rec.itemId);
    state.skips.set(k, { count: 1, last: rec.ts || now(), avoidUntilPick: 0 });
  }
}
bootLoad();

// --- Write APIs ---
export function appendAttempt(attempt) {
  ensureDataDir();
  const rec = { ...attempt, ts: attempt.ts || now() };
  // in-memory
  const arr = state.attempts.get(rec.userId) || [];
  arr.push(rec);
  state.attempts.set(rec.userId, arr);
  // disk append
  fs.appendFileSync(ATTEMPTS_FILE, JSON.stringify(rec) + '\n', 'utf8');
  return rec;
}

export function saveMastery(userId, masteryBucket) {
  const snapshot = Object.fromEntries(state.mastery);
  snapshot[userId] = masteryBucket;
  fs.writeFileSync(MASTERY_FILE, JSON.stringify(snapshot, null, 2), 'utf8');
}

export function flushAll() {
  // snapshot mastery
  const snapshot = Object.fromEntries(state.mastery);
  ensureDataDir();
  fs.writeFileSync(MASTERY_FILE, JSON.stringify(snapshot, null, 2), 'utf8');
  // attempts are already JSONL-append; no bulk flush required
}

// --- Mastery logic (very simple EXP & level curve) ---
export function bumpMastery(userId, skillIds = [], expAward = 5) {
  if (!skillIds.length) return;
  const bucket = state.mastery.get(userId) || {};
  for (const id of skillIds) {
    const cur = bucket[id] || { level: 0, exp: 0, lastSeen: 0 };
    const exp = (cur.exp || 0) + expAward;
    // 100 exp per level for this placeholder curve
    let level = cur.level || 0;
    while (exp >= (level + 1) * 100) level++;
    bucket[id] = { level, exp, lastSeen: now() };
  }
  state.mastery.set(userId, bucket);
  saveMastery(userId, bucket);
}

// --- Skips / cooldowns ---
// Cooldown for N "next picks" after a skip:
const AVOID_PICKS = 3;

export function recordSkip(userId, itemId, reason = 'user_skip') {
  ensureDataDir();
  const tick = (state.pickTick.get(userId) || 0);
  const k = keyFor(userId, itemId);
  const cur = state.skips.get(k) || { count: 0, last: 0, avoidUntilPick: 0 };
  const nextAvoid = tick + AVOID_PICKS;
  const upd = { count: (cur.count || 0) + 1, last: now(), avoidUntilPick: Math.max(cur.avoidUntilPick || 0, nextAvoid) };
  state.skips.set(k, upd);
  // append log
  const rec = { userId, itemId, reason, ts: upd.last, avoidUntilPick: upd.avoidUntilPick, pickTickAtSkip: tick };
  fs.appendFileSync(SKIPS_FILE, JSON.stringify(rec) + '\n', 'utf8');
  return upd;
}

export function shouldAvoidItem(userId, itemId) {
  const tick = (state.pickTick.get(userId) || 0);
  const k = keyFor(userId, itemId);
  const cur = state.skips.get(k);
  if (!cur) return false;
  return (tick < (cur.avoidUntilPick || 0));
}

export function tickNextPick(userId) {
  state.pickTick.set(userId, (state.pickTick.get(userId) || 0) + 1);
}

// --- Read APIs used elsewhere ---
export function getAttempts(userId) {
  return state.attempts.get(userId) || [];
}

export function getMastery(userId) {
  return state.mastery.get(userId) || {};
}

export function setUser(userId, data) {
  const cur = state.users.get(userId) || {};
  state.users.set(userId, { ...cur, ...data });
}

export function getUser(userId) {
  return state.users.get(userId) || null;
}

export function indexItems(items = []) {
  for (const it of items) {
    if (it?.id) state.itemsIndex.set(String(it.id), it);
  }
}

export function getItemById(id) {
  return state.itemsIndex.get(String(id)) || null;
}

