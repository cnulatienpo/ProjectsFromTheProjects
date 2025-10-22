const clampScore = (value) => {
  if (!Number.isFinite(value)) return 0;
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
};

const defaultRubric = ['Accuracy', 'Clarity', 'Voice'];

function normalizeSkillIds(result, item, mode) {
  if (Array.isArray(result?.skillIds) && result.skillIds.length) {
    return result.skillIds.map(String);
  }
  if (Array.isArray(item?.skillIds) && item.skillIds.length) {
    return item.skillIds.map(String);
  }
  return [`craft.${mode}`];
}

function why({ answer, item, mode }) {
  const text = typeof answer === 'string' ? answer : (answer?.text ?? '');
  const trimmed = String(text || '').trim();
  if (!trimmed) {
    return {
      score: 0,
      rubric: defaultRubric,
      spans: [],
      correctSequence: [],
      details: { message: 'Tell us why you write. An empty page cannot be graded.', mode },
      nextHints: ['Try listing a motive, a character, or a scene fragment.'],
      skillIds: normalizeSkillIds(null, item, mode),
    };
  }

  const wordCount = trimmed.split(/\s+/).filter(Boolean).length;
  const density = Math.min(1, wordCount / 80);
  const score = clampScore(0.7 + density * 0.2);
  const message = wordCount > 40
    ? 'Strong motive and detail. Consider adding a surprising image.'
    : 'Good start—push for one concrete image or beat.';

  return {
    score,
    rubric: defaultRubric,
    spans: [],
    correctSequence: [],
    details: { message, mode },
    fixSuggestion: 'Name one sensory detail or consequence to deepen the motive.',
    nextHints: ['Tag a beat like [ACTION] or [REVEAL] to anchor the intent.'],
    skillIds: normalizeSkillIds(null, item, mode),
  };
}

function name({ answer, item, mode }) {
  const sigils = Array.isArray(answer?.sigils) ? answer.sigils : [];
  const unique = Array.from(new Set(sigils.map((s) => String(s).toLowerCase().trim()).filter(Boolean)));
  const score = unique.length ? 0.7 : 0.2;
  const message = unique.length
    ? `Noted ${unique.length} sigil${unique.length === 1 ? '' : 's'}.`
    : 'No sigils detected—drop in tags like [ACTION] or [REVEAL].';

  return {
    score,
    rubric: ['Identification', 'Clarity'],
    spans: [],
    correctSequence: [],
    details: { message, mode },
    nextHints: unique.length ? ['Add a reason why this beat matters.'] : ['Tag at least one beat to identify.'],
    skillIds: normalizeSkillIds({ skillIds: [`sigil.name.${unique.length}`] }, item, mode),
  };
}

function highlight({ answer, item, mode }) {
  const spans = Array.isArray(answer?.spans) ? answer.spans : [];
  const totalLength = typeof item?.passage === 'string' ? item.passage.length : Number(item?.meta?.length ?? 0);
  const denominator = totalLength > 0 ? totalLength : 1;
  const coverage = spans.reduce((sum, span) => {
    const start = Number(span?.start ?? 0);
    const end = Number(span?.end ?? 0);
    if (!Number.isFinite(start) || !Number.isFinite(end)) return sum;
    return sum + Math.max(0, end - start);
  }, 0);
  const fraction = Math.max(0, Math.min(1, coverage / denominator));
  const score = clampScore(fraction);

  const message = fraction >= 0.5
    ? 'Great coverage—your highlights track the signal.'
    : 'Consider highlighting the key pivot sentences.';

  return {
    score,
    rubric: ['Coverage', 'Precision'],
    spans,
    correctSequence: [],
    details: { message, mode },
    nextHints: ['Aim for the moment the tone or stakes shift.'],
    skillIds: normalizeSkillIds(null, item, mode),
  };
}

function order({ answer, item, mode }) {
  const submitted = Array.isArray(answer?.order) ? answer.order.map((s) => String(s)) : [];
  const gold = Array.isArray(item?.gold?.order) ? item.gold.order.map((s) => String(s)) : [];
  if (!gold.length) {
    return {
      score: submitted.length ? 0.5 : 0,
      rubric: ['Sequence'],
      spans: [],
      correctSequence: [],
      details: { message: 'No canonical order provided—awarding partial credit.', mode },
      nextHints: [],
      skillIds: normalizeSkillIds(null, item, mode),
    };
  }

  const total = gold.length;
  let correct = 0;
  for (let i = 0; i < total; i += 1) {
    if (submitted[i] && submitted[i] === gold[i]) correct += 1;
  }
  const score = clampScore(total ? correct / total : 0);
  const message = score === 1
    ? 'Perfect sequence.'
    : `Placed ${correct} of ${total} beats correctly.`;

  return {
    score,
    rubric: ['Sequence', 'Tempo'],
    spans: [],
    correctSequence: gold,
    details: { message, mode },
    nextHints: ['Compare your order to the gold to see what shifted.'],
    skillIds: normalizeSkillIds(null, item, mode),
  };
}

function fix({ answer, item, mode }) {
  const choice = typeof answer?.choice === 'string' ? answer.choice.trim().toUpperCase() : '';
  const goldChoice = String(item?.gold?.choice ?? item?.gold?.choiceId ?? '').trim().toUpperCase();
  const correct = Boolean(choice) && choice === goldChoice;
  const score = correct ? 1 : 0;

  return {
    score,
    rubric: ['Accuracy'],
    spans: [],
    correctSequence: [],
    details: { message: correct ? 'Correct fix applied.' : `Gold answer is ${goldChoice || 'unknown'}.`, mode },
    fixSuggestion: correct ? undefined : 'Re-read the passage and match the stated issue to the right fix.',
    nextHints: correct ? ['Advance to the next beat.'] : ['Compare the tone of each option to the highlighted issue.'],
    skillIds: normalizeSkillIds(null, item, mode),
  };
}

function missing({ answer, item, mode }) {
  const inserted = typeof answer?.insertBeat === 'string' ? answer.insertBeat.trim().toLowerCase() : '';
  const expected = String(item?.gold?.expected ?? item?.gold?.missingBeat ?? '').trim().toLowerCase();
  const correct = inserted && expected ? inserted === expected : false;
  const score = correct ? 1 : 0.4;

  const message = correct
    ? 'You filled the gap with the expected beat.'
    : expected
      ? `Expected beat: ${expected}.`
      : 'No reference beat provided; partial credit.';

  return {
    score,
    rubric: ['Beat Sense'],
    spans: [],
    correctSequence: [],
    details: { message, mode },
    nextHints: correct ? ['Try writing the beat into the scene.'] : ['Revisit what emotion or action is missing.'],
    skillIds: normalizeSkillIds(null, item, mode),
  };
}

export const graders = { why, name, highlight, order, fix, missing };

export default graders;
