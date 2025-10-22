export const mem = {
  attempts: [],
  mastery: new Map(),
  skips: [],
  reports: new Map(),
  seen: new Map(),
};

function ensureSeenSet(userId) {
  if (!mem.seen.has(userId)) {
    mem.seen.set(userId, new Set());
  }
  return mem.seen.get(userId);
}

export function addAttempt(attempt) {
  const normalized = {
    ...attempt,
    userId: String(attempt.userId),
    itemId: String(attempt.itemId),
    mode: attempt.mode ?? 'why',
  };
  mem.attempts.push(normalized);
  ensureSeenSet(normalized.userId).add(String(normalized.itemId));
  return normalized;
}

export function addSkip(skip) {
  const normalized = {
    ...skip,
    userId: String(skip.userId),
    itemId: String(skip.itemId),
    mode: skip.mode ?? 'why',
    ts: skip.ts ?? Date.now(),
  };
  mem.skips.push(normalized);
  ensureSeenSet(normalized.userId).add(String(normalized.itemId));
  return normalized;
}

export function getLatestReport(userId) {
  return mem.reports.get(String(userId)) || null;
}

export function saveReport(userId, report) {
  mem.reports.set(String(userId), report);
  return report;
}

export function bumpMastery(userId, skillId, delta = 10) {
  const key = `${userId}:${skillId}`;
  const current = mem.mastery.get(key) || { level: 1, exp: 0 };
  current.exp += delta;
  while (current.exp >= 100) {
    current.exp -= 100;
    current.level += 1;
  }
  mem.mastery.set(key, current);
  return current;
}

export function getMastery(userId) {
  const prefix = `${userId}:`;
  const out = {};
  for (const [key, value] of mem.mastery) {
    if (key.startsWith(prefix)) {
      const [, skill] = key.split(':');
      out[skill] = value;
    }
  }
  return out;
}

export function userSeenSet(userId) {
  return mem.seen.get(String(userId)) || new Set();
}
