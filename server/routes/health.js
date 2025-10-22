import fs from 'node:fs';
import path from 'node:path';
import { Router } from 'express';
import * as mem from '../db/mem.js';

const router = Router();

const DIST_INDEX = path.join(process.cwd(), 'app', 'dist', 'index.html');

router.get('/api/healthz', (_req, res) => {
  const attemptsCount = Array.isArray(mem?.attempts?.rows) ? mem.attempts.rows.length : 0;
  const hasDist = fs.existsSync(DIST_INDEX);

  res.json({
    ok: true,
    uptime: process.uptime(),
    attemptsCount,
    hasDist,
  });
});

export default router;
