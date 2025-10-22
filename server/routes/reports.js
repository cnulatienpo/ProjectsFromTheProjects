import express from 'express';
import { getAttempts, getMastery } from '../db/mem.js';

const router = express.Router();

router.get('/reports/ping', (_req, res) => {
  res.json({ ok: true, ping: 'reports-route-alive' });
});

router.get('/reports/latest', (req, res) => {
  const userId = String(req.get('x-user-id') || req.query.userId || 'dev');
  const attempts = getAttempts(userId);
  const mastery = getMastery(userId);
  const lastAttempt = attempts.length ? attempts[attempts.length - 1] : null;
  if (lastAttempt || Object.keys(mastery || {}).length) {
    res.json({ ok: true, memo: { attempts: attempts.slice(-20), mastery } });
  } else {
    res.json({ ok: false, memo: null });
  }
});

export const reportsRouter = router;
export default router;

