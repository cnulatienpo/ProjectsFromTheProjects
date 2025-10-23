// server/routes/utils/getNext.js (ESM)
// Shared helper used by skip route to fetch a candidate next item.
// Respects mem.tickNextPick and mem.shouldAvoidItem.


import * as mem from '../../db/mem.js';
import scheduler from '../../scheduler/next.js';

export async function getNextItem(userId = 'dev') {
  mem.tickNextPick(userId);
  // Use scheduler.pickNext, which guarantees a normalized, non-empty catalog and real id
  const next = await scheduler.pickNext(userId);
  // Defensive: always return an object with id, item, userId
  if (!next || !next.id || !next.item) {
    return {
      id: 'why-boot-001',
      item: {
        id: 'why-boot-001',
        mode: 'why',
        prompt: 'Why does short→long sentence rhythm hit harder? One line.',
        meta: { source: 'fallback', level: 1, freshness: 3, introduces_beats: false }
      },
      userId
    };
  }
  return next;
}

export default { getNextItem };

