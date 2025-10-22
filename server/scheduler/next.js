// server/scheduler/next.js (ESM)
// Bias by (1) low mastery, (2) freshness/recency, (3) unlock gates via introduces_beats.
// Works with mem stores in server/db/mem.js and items shaped by server/content/loaders.js.

import * as mem from '../db/mem.js';

// Safeguards
const toArray = (x) => Array.isArray(x) ? x : (x == null ? [] : [x]);
const uniq = (arr) => Array.from(new Set(arr));

function now() { return Date.now(); }
function daysAgo(ts) {
  if (!ts) return Infinity;
  return (now() - ts) / (1000 * 60 * 60 * 24);
}

// beats unlocked for a user: stored in mem, or derivable from attempts + introduces_beats items
function getUnlockedBeats(userId) {
  const u = mem.getUser(userId) || {};
  const unlocked = new Set(toArray(u.unlockedBeats));
  // auto-derive from completed items that introduce beats
  const hist = mem.getAttempts(userId);
  for (const a of hist) {
    const item = mem.getItemById(a.itemId);
    const intro = toArray(item?.meta?.introduces_beats);
    intro.forEach(b => unlocked.add(String(b).toLowerCase()));
  }
  return unlocked;
}

function getUserMastery(userId) {
  // mastery map: skillId -> { level, exp, lastSeen }
  // mem provides a soft store; fallback to empty
  return mem.getMastery(userId) || {};
}

function inferSkillsFromItem(item) {
  // Prefer explicit skillIds; fall back to beat_tags
  const ids = new Set();
  toArray(item?.skillIds).forEach(s => ids.add(String(s)));
  toArray(item?.meta?.beat_tags).forEach(b => ids.add(`beat.${String(b).toLowerCase()}`));
  return Array.from(ids);
}

function scoreItemForUser(userId, item) {
  const mastery = getUserMastery(userId);
  const skills = inferSkillsFromItem(item);

  // 1) Weakness: lower mastery.level → higher need
  let weakness = 0;
  for (const s of skills) {
    const m = mastery[s];
    const lvl = m?.level ?? 0;
    weakness += (Math.max(0, 5 - lvl) / 5); // 0..1
  }
  if (skills.length) weakness = weakness / skills.length;

  // 2) Freshness: prefer items not seen recently
  const lastSeen = (() => {
    const hist = mem.getAttempts(userId).filter(a => a.itemId === item.id);
    if (!hist.length) return null;
    return Math.max(...hist.map(a => a.ts || a.time || 0));
  })();
  const days = daysAgo(lastSeen);
  const freshness = Math.min(1, Math.max(0, days / 7)); // fully fresh after ~7 days, 0 if seen today

  // 3) Unlock gates via introduces_beats
  const unlocks = getUnlockedBeats(userId);
  const introduced = toArray(item?.meta?.introduces_beats).map(b => String(b).toLowerCase());
  const requires = toArray(item?.meta?.beat_tags).map(b => String(b).toLowerCase());

  let gate = 1;
  // allow any item that introduces beats (that’s how you unlock!)
  if (!introduced.length && requires.length) {
    // if it requires beats the user doesn't have, down-rank hard
    const missingReq = requires.filter(b => !unlocks.has(b));
    if (missingReq.length) gate = 0.05; // not strictly forbidden, just very unlikely
  }

  // Combine: weighted sum → 0..1 then small jitter for variety
  const combined = (0.55 * weakness) + (0.35 * freshness) + (0.10 * gate);
  const jitter = (Math.random() * 0.04) - 0.02; // ±0.02
  const finalScore = Math.max(0, Math.min(1, combined + jitter));

  return { score: finalScore, components: { weakness, freshness, gate, skills, introduced, requires } };
}

export function pickNextItem(userId, pool) {
  const items = Array.isArray(pool) ? pool : [];
  if (!items.length) return null;

  // Filter out items marked as retired/disabled if present
  const candidates = items.filter(i => !i?.meta?.retired);

  let best = null;
  let bestScore = -1;

  for (const item of candidates) {
    const { score, components } = scoreItemForUser(userId || 'dev', item);
    if (score > bestScore) {
      bestScore = score;
      best = { ...item, _score: score, _why: components };
    }
  }

  return best;
}

export default { pickNextItem };
