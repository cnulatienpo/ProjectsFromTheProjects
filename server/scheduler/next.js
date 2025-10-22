import { getAllItems } from '../content/items.js';
import { mem, getMastery, getAttempts, userSeenSet } from '../db/mem.js';

const SUPPORTED_MODES = new Set(['why', 'name', 'highlight', 'order', 'fix', 'missing']);
const RECENT_ATTEMPT_WINDOW = 1000 * 60 * 20; // 20 minutes
const RECENT_SKIP_WINDOW = 1000 * 60 * 30; // 30 minutes

function normalizeItemShape(item) {
  if (!item) return null;
  const payload = {
    id: item.id,
    mode: item.mode || 'why',
  };
  if (item.passage) payload.passage = item.passage;
  if (item.options) payload.options = item.options;
  if (item.gold) payload.gold = item.gold;
  if (item.meta) payload.meta = item.meta;
  if (item.skillIds) payload.skillIds = item.skillIds;
  return payload;
}

const toSkillList = (item) => {
  if (Array.isArray(item?.skillIds) && item.skillIds.length) {
    return item.skillIds.map((id) => String(id)).filter(Boolean);
  }
  if (Array.isArray(item?.meta?.beat_tags) && item.meta.beat_tags.length) {
    return item.meta.beat_tags.map((id) => String(id)).filter(Boolean);
  }
  return [];
};

const computeWeakness = (skillIds, masterySkills, overallLevel) => {
  if (!skillIds.length) {
    return 1 / Math.max(1, overallLevel || 1);
  }
  let totalLevel = 0;
  let missing = 0;
  for (const skillId of skillIds) {
    const data = masterySkills[skillId];
    if (!data) {
      missing += 1;
      totalLevel += 0.5;
    } else {
      totalLevel += Math.max(0.5, data.level);
    }
  }
  const average = totalLevel / skillIds.length;
  const base = 1 / Math.max(average, 0.5);
  const missingBonus = missing ? missing / skillIds.length : 0;
  return base + missingBonus;
};

const computePenalty = (timestamp, window, now) => {
  if (!timestamp) return 0;
  const delta = now - timestamp;
  if (delta <= 0) return 1;
  if (delta >= window) return 0;
  return 1 - delta / window;
};

export function pickNext({ userId }) {
  const user = userId ? String(userId) : 'dev';
  const items = getAllItems();
  if (!items.length) {
    throw new Error('No items available');
  }

  const mastery = getMastery(user);
  const masterySkills = mastery?.skills || {};
  const overallLevel = mastery?.level || 1;
  const attempts = getAttempts(user, { limit: 120 });
  const seen = userSeenSet(user);
  const now = Date.now();

  const lastAttemptByItem = new Map();
  for (const attempt of attempts) {
    const id = String(attempt.itemId);
    const ts = Number(attempt.ts ?? (attempt.gradedAt ? Date.parse(attempt.gradedAt) : 0));
    if (!lastAttemptByItem.has(id) || ts > lastAttemptByItem.get(id)) {
      lastAttemptByItem.set(id, ts);
    }
  }

  const lastSkipByItem = new Map();
  for (const skip of mem.skips) {
    if (String(skip.userId) !== user) continue;
    const id = String(skip.itemId);
    const ts = Number(skip.ts) || 0;
    if (!lastSkipByItem.has(id) || ts > lastSkipByItem.get(id)) {
      lastSkipByItem.set(id, ts);
    }
  }

  const candidates = items.filter((item) => SUPPORTED_MODES.has(item.mode || 'why'));
  const pool = candidates.length ? candidates : items;

  const scored = pool
    .map((item) => {
      const itemId = String(item.id);
      const skillIds = toSkillList(item);
      const weakness = computeWeakness(skillIds, masterySkills, overallLevel);
      const unseenBonus = seen.has(itemId) ? 0 : 0.8;
      const introduceBonus = Array.isArray(item?.meta?.introduces_beats) && item.meta.introduces_beats.length ? 0.3 : 0;
      const recencyPenalty = computePenalty(lastAttemptByItem.get(itemId), RECENT_ATTEMPT_WINDOW, now);
      const skipPenalty = computePenalty(lastSkipByItem.get(itemId), RECENT_SKIP_WINDOW, now) * 1.3;
      const seenPenalty = seen.has(itemId) ? 0.05 : 0;
      const priority = weakness + unseenBonus + introduceBonus - recencyPenalty - skipPenalty - seenPenalty;
      return { item, priority };
    })
    .sort((a, b) => {
      if (b.priority !== a.priority) return b.priority - a.priority;
      return String(a.item.id).localeCompare(String(b.item.id));
    });

  const chosen = scored.length ? scored[0].item : pool[0];
  return normalizeItemShape(chosen);
}

export default pickNext;
