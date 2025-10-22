import express from 'express';
import { getLatestReport } from '../db/mem.js';

const router = express.Router();

router.get('/reports/ping', (_req, res) => {
  res.json({ ok: true, ping: 'reports-route-alive' });
});

router.get('/reports/latest', (req, res) => {
  const userId = String(req.get('x-user-id') || req.query.userId || 'dev');
  const memo = getLatestReport(userId);
  if (memo) {
    res.json({ ok: true, memo });
  } else {
    res.json({ ok: false, memo: null });
  }
});

export const reportsRouter = router;
export default router;
