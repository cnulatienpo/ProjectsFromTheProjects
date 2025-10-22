import { Router } from 'express';
import * as mem from '../db/mem.js';

const router = Router();

router.get('/api/version', (_req, res) => {
  const attemptsCount = Array.isArray(mem?.attempts?.rows) ? mem.attempts.rows.length : 0;

  res.json({
    ok: true,
    sha: process.env.GIT_SHA || 'dev',
    builtAt: process.env.BUILT_AT || new Date().toISOString(),
    attemptsCount,
  });
});

export default router;
