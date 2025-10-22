import express from 'express';
import { buildMemo } from '../reports/buildMemo.js';

const router = express.Router();

router.get('/api/reports/ping', (_req, res) => {
  res.json({ ok: true, ping: 'reports-route-alive' });
});

router.get('/api/reports/latest', async (req, res) => {
  const userId = String(req.header('x-user-id') || req.query.userId || 'dev');
  try {
    const memo = await buildMemo(userId);
    res.json({ ok: true, userId, memo });
  } catch (e) {
    console.error('[reports/latest] error:', e?.stack || e);
    res.status(200).json({ ok: false, error: 'memo_failed', message: e?.message || String(e) });
  }
});

export default router;
