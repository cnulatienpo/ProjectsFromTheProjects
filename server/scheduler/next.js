import { getAllItems } from '../content/items.js';
import { mem, userSeenSet } from '../db/mem.js';

const SUPPORTED_MODES = new Set(['why', 'name', 'highlight', 'order', 'fix', 'missing']);

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

function shouldPrioritize(item, seenSet) {
  const introduces = Array.isArray(item?.meta?.introduces_beats) ? item.meta.introduces_beats : [];
  if (!introduces.length) return false;
  return !seenSet.has(String(item.id));
}

export function pickNext({ userId }) {
  const user = userId ? String(userId) : 'dev';
  const items = getAllItems();
  if (!items.length) {
    throw new Error('No items available');
  }

  const seen = new Set(Array.from(userSeenSet(user))); 
  const recentSkipIds = mem.skips
    .filter((skip) => skip.userId === user && Date.now() - skip.ts < 1000 * 60 * 30)
    .map((skip) => String(skip.itemId));
  for (const skipId of recentSkipIds) {
    seen.add(skipId);
  }

  const allowedModes = items.filter((item) => SUPPORTED_MODES.has(item.mode || 'why'));
  const pool = allowedModes.length ? allowedModes : items.filter((item) => (item.mode || 'why') === 'why');
  const candidates = pool.length ? pool : items;

  const priority = [];
  const unseenPreferred = [];
  const fallback = [];

  for (const item of candidates) {
    const id = String(item.id);
    const mode = item.mode || 'why';
    const blocked = seen.has(id);
    const shape = normalizeItemShape(item);
    if (!shape) continue;

    if (shouldPrioritize(item, seen)) {
      priority.push(shape);
      continue;
    }

    if (!blocked) {
      if (SUPPORTED_MODES.has(mode)) {
        unseenPreferred.push(shape);
      } else {
        fallback.push(shape);
      }
    }
  }

  const finalPool = priority.length
    ? priority
    : (unseenPreferred.length ? unseenPreferred : (fallback.length ? fallback : candidates.map(normalizeItemShape)));

  if (!finalPool.length) {
    const any = candidates.map(normalizeItemShape).filter(Boolean);
    if (!any.length) return normalizeItemShape(items[0]);
    return any[Math.floor(Math.random() * any.length)];
  }

  return finalPool[Math.floor(Math.random() * finalPool.length)];
}

export default pickNext;
