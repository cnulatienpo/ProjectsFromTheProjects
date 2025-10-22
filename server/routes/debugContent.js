
import express from 'express';
import { attempts, skips, mastery } from '../db/mem.js';
import { pickNext } from '../scheduler/next.js';

const router = express.Router();
router.get('/api/debug/content', async (_req, res) => {
  // Robust ESM import that tolerates different export shapes from content/loaders.js
  const __content = await import('../content/loaders.js');
  const getCatalog =
    __content.getCatalog ??
    __content.loadCatalog ??
    (__content.default &&
      (typeof __content.default === 'function'
        ? __content.default
        : __content.default.getCatalog));
  if (typeof getCatalog !== 'function') {
    return res.status(500).json({ error: 'Expected getCatalog() from ../content/loaders.js (named, loadCatalog, or default).' });
  }
  const all = await getCatalog();
  const sample = all && all[0] ? { id: String(all[0].id), mode: all[0].mode, meta: all[0].meta } : null;
  const nextItem = pickNext('dev');
  res.json({
    totalItems: Array.isArray(all) ? all.length : 0,
    modes: Array.isArray(all) ? all.reduce((m, it) => { m[it.mode] = (m[it.mode] || 0) + 1; return m; }, {}) : {},
    sample,
    nextItem,
    attempts: attempts.rows.length,
    skips: Array.isArray(skips.rows) ? skips.rows.length : 0,
    mastery
  });
});
export default router;
