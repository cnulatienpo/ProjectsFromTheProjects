// server/routes/next.js (ESM)
import express from 'express';
import { getNextItem } from './utils/getNext.js';

const router = express.Router();

router.get('/api/next', async (req, res) => {
  try {
    const userId = String(req.get('x-user-id') || req.query.userId || 'dev');
    const next = await getNextItem(userId);
    res.json(next || {});
  } catch (e) {
    res.status(500).json({ error: String(e?.message || e) });
  }
});

export default router;

