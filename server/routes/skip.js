import express from 'express';
import { skips } from '../db/mem.js';

const router = express.Router();
router.post('/api/skip', express.json(), (req, res) => {
  const { userId = 'dev', itemId, mode, reason = 'user_skip' } = req.body || {};
  if (!itemId) return res.status(400).json({ ok: false, error: 'missing itemId' });
  if (!Array.isArray(skips.rows)) skips.rows = [];
  skips.rows.push({ userId, itemId: String(itemId), mode, reason, ts: Date.now() });
  res.json({ ok: true });
});
export default router;
