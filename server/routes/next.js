import { Router } from 'express';
import { pickNext } from '../scheduler/next.js';

const router = Router();

router.get('/next', (req, res) => {
  try {
    const userId = String(req.query.userId || req.get('x-user-id') || 'dev');
    const item = pickNext({ userId });
    res.json({ ok: true, item });
  } catch (err) {
    console.error('[next] failed to select item', err);
    res.status(500).json({ ok: false, error: 'next_failed', message: err?.message });
  }
});

export default router;
