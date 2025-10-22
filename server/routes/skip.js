import express from 'express';
import { addSkip } from '../db/mem.js';

const router = express.Router();

router.use(express.json());

router.post('/skip', (req, res) => {
  const body = req.body ?? {};
  const userId = String(body.userId || req.get('x-user-id') || 'dev');
  const itemIdRaw = body.itemId ?? body.id;
  if (!itemIdRaw) {
    return res.status(400).json({ ok: false, error: 'missing_item_id' });
  }

  const mode = String(body.mode || '').trim() || 'why';
  addSkip({
    userId,
    itemId: String(itemIdRaw),
    mode,
    reason: body.reason || 'user_skip',
    ts: Date.now(),
  });

  return res.json({ ok: true });
});

export default router;
