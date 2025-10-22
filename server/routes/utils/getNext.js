// server/routes/utils/getNext.js (ESM)
// Shared helper used by skip route to fetch a candidate next item.
// Respects mem.tickNextPick and mem.shouldAvoidItem.

import * as mem from '../../db/mem.js';
import { loadPracticePool } from '../../content/loaders.js';
import scheduler from '../../scheduler/next.js';

export async function getNextItem(userId = 'dev') {
  const pool = await loadPracticePool(); // returns array of items
  // avoid immediately resurfacing skipped items: filter by mem.shouldAvoidItem
  const filtered = pool.filter(it => !mem.shouldAvoidItem(userId, it.id));
  // Advance the rolling "pick tick" each time we compute next:
  mem.tickNextPick(userId);
  // let scheduler pick the best
  const next = scheduler.pickNextItem(userId, filtered);
  return next || filtered[0] || pool[0] || null;
}

export default { getNextItem };

