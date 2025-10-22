import express from 'express';
import grade from '../graders/index.js';
import { getItemById } from '../content/items.js';
import * as mem from '../db/mem.js';

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

  let result;
  try {
    result = grade(mode, { item, answer, userId, itemId });
  } catch (err) {
    console.error('[attempt] grader failed', err);
    return res.status(500).json({ ok: false, error: 'grading_failed', message: err?.message });
  }

  const score = Number.isFinite(result?.score) ? Math.max(0, Math.min(1, Number(result.score))) : 0;
  const rubric = Array.isArray(result?.rubric) ? result.rubric.map((entry) => String(entry)) : [];
  const spans = Array.isArray(result?.spans) ? result.spans : [];
  const correctSequence = Array.isArray(result?.correctSequence) ? result.correctSequence : [];
  const fixSuggestion = result?.fixSuggestion != null ? String(result.fixSuggestion) : null;
  const nextHints = Array.isArray(result?.nextHints) ? result.nextHints.map((hint) => String(hint)) : [];
  const details = result?.details && typeof result.details === 'object' ? { ...result.details } : {};
  details.mode = details.mode || mode;

  const rawSkillIds = Array.isArray(item?.skillIds) && item.skillIds.length
    ? item.skillIds
    : (Array.isArray(item?.meta?.beat_tags) ? item.meta.beat_tags : []);
  const skillIds = rawSkillIds.map((id) => String(id)).filter(Boolean);

  const expAward = Math.round((score || 0) * 20) + 5;

  details.expAward = expAward;
  if (!details.skillIds) {
    details.skillIds = skillIds;
  }

  const gradedAt = result?.gradedAt ? String(result.gradedAt) : new Date().toISOString();

  mem.appendAttempt({
    userId,
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
  });

  if (skillIds.length) {
    mem.bumpMastery(userId, skillIds, expAward);
  }

  const mastery = mem.getMastery(userId);
  const masterySummary = skillIds.reduce((acc, id) => {
    const entry = mastery?.[id];
    if (entry) acc[id] = entry;
    return acc;
  }, {});

  return res.json({
    ok: true,
    userId,
    itemId,
    mode,
    score,
    rubric,
    spans,
    correctSequence,
    fixSuggestion,
    nextHints,
    details,
    leveledUp: false,
    level: null,
    badges: [],
    memo: undefined,
    gradedAt,
    mastery: masterySummary,
  });
});

export default router;

