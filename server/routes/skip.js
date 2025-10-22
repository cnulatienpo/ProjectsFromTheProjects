// server/routes/skip.js (ESM)
import express from 'express';
import * as mem from '../db/mem.js';
import { getNextItem } from './utils/getNext.js'; // tiny helper we’ll add below

const router = express.Router();

// POST /api/skip  { userId, itemId, mode, reason }
router.post('/api/skip', express.json(), async (req, res) => {
  const { userId = 'dev', itemId, reason = 'user_skip' } = req.body || {};
  if (!itemId) return res.status(400).json({ ok: false, error: 'missing itemId' });

  mem.recordSkip(String(userId), String(itemId), String(reason));
  // after recording, advance pick-tick once so the cooldown counter makes progress on next call
  mem.tickNextPick(String(userId));

  // reply with ok; UI will call /api/next, but we can also include a courtesy next
  try {
    const next = await getNextItem(String(userId));
    return res.json({ ok: true, skipped: { itemId, reason }, next });
  } catch {
    return res.json({ ok: true, skipped: { itemId, reason } });
  }
});

export default router;

