import express from 'express';
import { getLatestReport } from '../db/mem.js';

const router = express.Router();

router.get('/reports/ping', (_req, res) => {
  res.json({ ok: true, ping: 'reports-route-alive' });
});

router.get('/reports/latest', (req, res) => {
  const userId = String(req.query.userId || req.get('x-user-id') || 'dev');
  const memo = getLatestReport(userId);
  res.json({ ok: true, memo });
});

export const reportsRouter = router;
export default router;
