import express from 'express';
import { graders } from '../graders/index.js';
import { addAttempt, bumpMastery, mem, saveReport } from '../db/mem.js';
import { getItemById } from '../content/items.js';
import { buildStyleReport } from '../reports/buildMemo.js';

const router = express.Router();

router.use(express.json());

router.get('/', (_req, res) => {
  res.json({ ok: true, ping: 'attempt-route-alive' });
});

router.post('/', (req, res) => {
  const body = req.body ?? {};
  const userId = String(body.userId || req.get('x-user-id') || 'dev');
  const itemIdRaw = body.itemId ?? body.id;
  if (!itemIdRaw) {
    return res.status(400).json({ ok: false, error: 'missing_item_id' });
  }

  const itemId = String(itemIdRaw);
  const mode = String(body.mode || '').trim() || 'why';
  const answer = body.answer ?? null;

  const item = getItemById(itemId);
  if (!item) {
    return res.status(404).json({ ok: false, error: 'item_not_found', itemId });
  }

  const grader = graders[mode] || graders.why;
  let gradeResult;
  try {
    gradeResult = grader({ userId, itemId, mode, answer, item });
  } catch (err) {
    console.error('[attempt] grader failed', err);
    return res.status(500).json({ ok: false, error: 'grading_failed', message: err?.message });
  }

  const score = Number.isFinite(gradeResult?.score) ? Math.max(0, Math.min(1, gradeResult.score)) : 0;
  const rubric = Array.isArray(gradeResult?.rubric)
    ? gradeResult.rubric.map((entry) => (typeof entry === 'string' ? entry : String(entry))).filter(Boolean)
    : [];
  const spans = Array.isArray(gradeResult?.spans) ? gradeResult.spans : [];
  const correctSequence = Array.isArray(gradeResult?.correctSequence) ? gradeResult.correctSequence : [];
  const fixSuggestion = gradeResult?.fixSuggestion ?? null;
  const nextHints = Array.isArray(gradeResult?.nextHints) ? gradeResult.nextHints : [];
  const details = gradeResult?.details && typeof gradeResult.details === 'object'
    ? { ...gradeResult.details, mode }
    : { message: 'graded', mode };
  const gradedAt = new Date().toISOString();

  const attemptRecord = {
    userId,
    itemId,
    mode,
    answer,
    score,
    rubric,
    details,
    gradedAt,
  };

  addAttempt(attemptRecord);

  const skillIds = Array.isArray(gradeResult?.skillIds) && gradeResult.skillIds.length
    ? gradeResult.skillIds
    : (Array.isArray(item?.skillIds) && item.skillIds.length ? item.skillIds : [`craft.${mode}`]);

  let leveledUp = false;
  let highestLevel = 1;
  const badgeSet = new Set();

  for (const skillId of skillIds) {
    const key = String(skillId);
    const before = mem.mastery.get(`${userId}:${key}`)?.level ?? 1;
    const delta = Math.max(5, Math.round(score * 20));
    const after = bumpMastery(userId, key, delta);
    if (after.level > before) {
      leveledUp = true;
      highestLevel = Math.max(highestLevel, after.level);
    }
  }

  let memo = null;
  if (leveledUp) {
    memo = buildStyleReport(userId);
    saveReport(userId, memo);
    badgeSet.add('Beat Scout');
    badgeSet.add('Clause Wrangler');
  }

  const response = {
    ok: true,
    itemId,
    mode,
    score,
    rubric,
    spans,
    correctSequence,
    fixSuggestion,
    nextHints,
    details,
    gradedAt,
  };

  response.skillIds = skillIds.map((id) => String(id));

  if (leveledUp) {
    response.leveledUp = true;
    response.level = highestLevel;
    response.badges = Array.from(badgeSet);
    response.memo = memo;
  }

  return res.json(response);
});

export default router;
