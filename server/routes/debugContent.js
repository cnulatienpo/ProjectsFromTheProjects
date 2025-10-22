import { Router } from 'express';
import { pickNextItem } from '../scheduler/next.js';
import { getAllItems } from '../content/items.js';
import { getMastery, getAttempts } from '../db/mem.js';

const router = Router();

router.get('/api/debug/content', async (req, res) => {
  try {
    const userIdRaw = req.query.userId;
    const userId = typeof userIdRaw === 'string' && userIdRaw.trim() ? userIdRaw.trim() : 'dev';

    let items = [];
    try {
      items = getAllItems();
    } catch {
      items = [];
    }

    const byMode = items.reduce((acc, item) => {
      const mode = item?.mode || 'unknown';
      acc[mode] = (acc[mode] || 0) + 1;
      return acc;
    }, {});
    const total = items.length;

    const sample = total
      ? {
          id: items[0]?.id ?? null,
          mode: items[0]?.mode ?? null,
          meta: items[0]?.meta ?? {},
        }
      : null;

    let nextItem = null;
    try {
      const candidate = pickNextItem(userId, items);
      if (candidate) {
        nextItem = { id: candidate.id, mode: candidate.mode };
      }
    } catch {
      nextItem = null;
    }

    const mastery = getMastery(userId);
    const attempts = getAttempts(userId);

    res.status(200).json({
      ok: true,
      sha: process.env.GIT_SHA || 'dev',
      builtAt: process.env.BUILT_AT || new Date().toISOString(),
      total,
      byMode,
      sample,
      nextItem,
      totalItems: total,
      modes: byMode,
      attempts: attempts.length,
      skips: null,
      mastery,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: message });
  }
});

export default router;
