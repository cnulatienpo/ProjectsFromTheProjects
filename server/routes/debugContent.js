import express from 'express';
import { getCatalog } from '../content/loaders.js';
import { attempts, skips, mastery } from '../db/mem.js';
import { pickNext } from '../scheduler/next.js';

const router = express.Router();
router.get('/api/debug/content', (_req, res) => {
  const all = getCatalog();
  const sample = all && all[0] ? { id: String(all[0].id), mode: all[0].mode, meta: all[0].meta } : null;
  const nextItem = pickNext('dev');
  res.json({
    totalItems: Array.isArray(all) ? all.length : 0,
    modes: Array.isArray(all) ? all.reduce((m,it)=>{m[it.mode]=(m[it.mode]||0)+1; return m;}, {}) : {},
    sample,
    nextItem,
    attempts: attempts.rows.length,
    skips: Array.isArray(skips.rows) ? skips.rows.length : 0,
    mastery
  });
});
export default router;
