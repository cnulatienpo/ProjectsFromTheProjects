import express from 'express';

const router = express.Router();

router.get('/reports/ping', (_req, res) => {
  res.json({ ok: true, ping: 'reports-route-alive' });
});

router.get('/reports/latest', (_req, res) => {
  res.json({ ok: true, memo: null });
});

export default router;

