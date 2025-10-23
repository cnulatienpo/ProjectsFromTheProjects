import express from 'express';
import { grade } from '../graders/index.js';
import { addExp } from '../db/mem.js';

const router = express.Router();

router.use(express.json());

router.get('/', (_req, res) => {
  res.json({ ok: true, ping: 'attempt-route-alive' });
});

router.post('/', async (req, res) => {
  const body = req.body ?? {};
  const { userId, itemId, mode, answer } = body;

  const normalizedUserId = typeof userId === 'string' && userId.trim()
    ? userId.trim()
    : String(req.get('x-user-id') || 'dev');
  const itemIdRaw = itemId ?? body.id;
  const normalizedItemId = itemIdRaw != null
    ? String(itemIdRaw)
    : null;

  if (!normalizedItemId) {
    return res.status(400).json({ ok: false, error: 'missing_item_id' });
  }

  const normalizedMode = typeof mode === 'string' && mode.trim() ? mode.trim() : 'why';
  const item = { id: normalizedItemId };

  let result;
  try {
    result = await grade({ mode: normalizedMode, item, answer, userId: normalizedUserId });
  } catch (e) {
    console.error('[attempt] grade error:', e && e.stack ? e.stack : e);
    return res.status(200).json({
      ok: false,
      error: 'grading_failed',
      message: e?.message || String(e),
      userId: normalizedUserId,
      itemId: normalizedItemId,
      mode: normalizedMode,
    });
  }

  const score = Number.isFinite(result?.score) ? result.score : 0;
  const rubric = Array.isArray(result?.rubric) ? result.rubric : [];
  const spans = Array.isArray(result?.spans) ? result.spans : [];
  const correctSequence = Array.isArray(result?.correctSequence) ? result.correctSequence : [];
  const fixSuggestion = result?.fixSuggestion ?? null;
  const nextHints = Array.isArray(result?.nextHints) ? result.nextHints : [];
  const detailsBase = result?.details && typeof result.details === 'object' ? result.details : {};
  const expAwardedRaw = Number(detailsBase?.expAwarded ?? Math.round(score * 100));
  const expAwarded = Number.isFinite(expAwardedRaw) ? expAwardedRaw : Math.round(score * 100);
  const { leveledUp, level, badges } = addExp(normalizedUserId, expAwarded);
  const details = { ...detailsBase, expAwarded };
  const gradedAtValue = result?.gradedAt;

  let gradedAt = new Date().toISOString();
  if (typeof gradedAtValue === 'string' && gradedAtValue.trim()) {
    gradedAt = gradedAtValue;
  } else if (gradedAtValue instanceof Date && !Number.isNaN(gradedAtValue.valueOf())) {
    gradedAt = gradedAtValue.toISOString();
  }

  const normalized = {
    ok: true,
    userId: normalizedUserId,
    itemId: item?.id ?? null,
    mode: normalizedMode,
    score,
    rubric,
    spans,
    correctSequence,
    fixSuggestion,
    nextHints,
    details,
    leveledUp,
    level,
    badges,
    gradedAt,
  };

  return res.json(normalized);
});

export default router;

