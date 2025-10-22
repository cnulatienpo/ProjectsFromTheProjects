const SUPPORTED_MODES = ['why', 'name', 'missing', 'order', 'highlight', 'fix'];

const clampScore = (value) => {
  if (!Number.isFinite(value)) return 0;
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
};

const defaultRubric = ['Accuracy', 'Clarity', 'Voice'];

const toLower = (value) => String(value || '').trim().toLowerCase();

const normalizeStringList = (input) => {
  if (!input) return [];
  if (Array.isArray(input)) {
    return input
      .map((entry) => toLower(typeof entry === 'string' ? entry : entry?.id ?? entry))
      .filter(Boolean);
  }
  if (typeof input === 'string') {
    return input
      .split(/[\s,]+/)
      .map((entry) => entry.trim().toLowerCase())
      .filter(Boolean);
  }
  return [];
};

const normalizeSpans = (spans) => {
  if (!Array.isArray(spans)) return [];
  return spans
    .map((span) => {
      const start = Number(span?.start ?? span?.[0]);
      const end = Number(span?.end ?? span?.[1]);
      if (!Number.isFinite(start) || !Number.isFinite(end)) return null;
      const a = Math.max(0, Math.min(start, end));
      const b = Math.max(0, Math.max(start, end));
      if (b <= a) return null;
      return { start: a, end: b };
    })
    .filter(Boolean);
};

const safeDetails = (details) => {
  if (details && typeof details === 'object' && !Array.isArray(details)) {
    return { ...details };
  }
  return {};
};

const normalizeHints = (hints) => {
  if (!Array.isArray(hints)) return [];
  return hints.map((hint) => String(hint || '').trim()).filter(Boolean);
};

const scoreFromWordCount = (wordCount) => {
  if (!Number.isFinite(wordCount) || wordCount <= 0) return 0.25;
  if (wordCount >= 120) return 0.95;
  if (wordCount >= 60) return 0.85;
  if (wordCount >= 30) return 0.7;
  return 0.45;
};

const defaultDetails = (mode) => ({ mode, message: 'graded' });

const skillIdFallback = (item, mode) => {
  if (Array.isArray(item?.skillIds) && item.skillIds.length) {
    return item.skillIds.map((id) => String(id));
  }
  if (Array.isArray(item?.meta?.beat_tags) && item.meta.beat_tags.length) {
    return item.meta.beat_tags.map((id) => String(id));
  }
  return [`craft.${mode}`];
};

const getGoldBeats = (item) => {
  const beats = new Set();
  normalizeStringList(item?.gold?.order).forEach((beat) => beats.add(beat));
  normalizeStringList(item?.meta?.beat_tags).forEach((beat) => beats.add(beat));
  normalizeStringList(item?.skillIds).forEach((beat) => beats.add(beat));
  return Array.from(beats);
};

const overlap = (a, b) => {
  const entries = new Set(a);
  let matches = 0;
  for (const value of b) {
    if (entries.has(value)) matches += 1;
  }
  return { matches, total: b.length };
};

const pickMessage = (score, { high, mid, low }) => {
  if (score >= 0.85) return high;
  if (score >= 0.6) return mid;
  return low;
};

const gradeWhy = ({ item, answer }) => {
  const text = typeof answer === 'string' ? answer : String(answer?.text ?? answer?.raw ?? '').trim();
  const clean = text.trim();
  const wordCount = clean ? clean.split(/\s+/).filter(Boolean).length : 0;
  const beatHits = getGoldBeats(item);
  const hasBeatCallout = beatHits.some((beat) => {
    const escaped = beat.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`\\b${escaped}\\b`, 'i').test(clean);
  });
  const hasBecause = /\b(because|so that|therefore|to unlock)\b/i.test(clean);
  const hasImage = /(heat|light|shadow|color|texture|sound)/i.test(clean);

  const score = clampScore(Math.min(0.98, scoreFromWordCount(wordCount) + (hasBeatCallout ? 0.08 : 0) + (hasImage ? 0.04 : 0)));
  const message = pickMessage(score, {
    high: 'Layered rationale with specific images—keep the pressure.',
    mid: 'Solid motive—add one more concrete beat or consequence.',
    low: 'Give us a clear motive and the beat that will carry it.',
  });

  return {
    score,
    rubric: defaultRubric,
    spans: [],
    correctSequence: [],
    fixSuggestion: 'Name the beat you are steering toward and drop in one sensory hook.',
    nextHints: [
      hasBeatCallout ? 'Push the reveal or payoff one step further.' : 'Try adding a Reveal 👁️ before the Payoff 🎉.',
      hasBecause ? 'Layer the stakes: what changes if the beat lands?' : 'Connect motive to stakes with a “because” clause.',
    ],
    details: { message, wordCount, mode: 'why' },
  };
};

const gradeName = ({ item, answer, mode = 'name' }) => {
  const submitted = normalizeStringList(
    typeof answer === 'string'
      ? answer
      : Array.isArray(answer?.sigils)
        ? answer.sigils
        : answer
  );

  const goldBeats = normalizeStringList(item?.gold?.rationaleTags);
  const skillBeats = normalizeStringList(item?.meta?.beat_tags);
  const canonical = new Set([...goldBeats, ...skillBeats]);

  if (!canonical.size) {
    return {
      score: 0.7,
      rubric: ['Identification', 'Beat Fit'],
      spans: [],
      correctSequence: [],
      fixSuggestion: 'List each beat explicitly—comma-separated works great.',
      nextHints: ['Anchor each tag to a specific turn in the text.'],
      details: { message: 'No reference beats available; granting neutral credit.', provided: submitted, mode },
    };
  }

  const { matches, total } = overlap(canonical, submitted);
  const coverage = total ? matches / canonical.size : 0;
  const score = clampScore(Math.max(0, coverage));

  const missList = [...canonical].filter((beat) => !submitted.includes(beat));

  return {
    score,
    rubric: ['Identification', 'Beat Fit'],
    spans: [],
    correctSequence: [],
    fixSuggestion: missList.length ? `Double-check the beat(s): ${missList.join(', ')}.` : null,
    nextHints: missList.length
      ? ['Re-read the turn where tone or stakes shift and tag that beat.']
      : ['Add a quick why-this-matters note next time to cement the tag.'],
    details: {
      message: matches === canonical.size ? 'Perfect tag coverage.' : `Tagged ${matches} of ${canonical.size} reference beats.`,
      provided: submitted,
      expected: [...canonical],
      mode,
    },
  };
};

const gradeMissing = ({ item, answer, mode = 'missing' }) => {
  const inserted = toLower(typeof answer === 'string' ? answer : answer?.insertBeat ?? answer?.text ?? '');
  const expected = toLower(item?.gold?.expected ?? item?.gold?.missingBeat ?? '');

  if (!expected) {
    return {
      score: 0.7,
      rubric: ['Beat Sense', 'Continuity'],
      spans: [],
      correctSequence: [],
      fixSuggestion: 'Frame the beat in terms of how it shifts the stakes.',
      nextHints: ['Describe the action or emotion that would bridge the gap.'],
      details: { message: 'No gold beat provided; awarding middle credit.', provided: inserted || null, mode },
    };
  }

  const correct = inserted === expected || (inserted && expected && expected.includes(inserted));
  const score = correct ? 1 : inserted ? 0.45 : 0.2;

  return {
    score: clampScore(score),
    rubric: ['Beat Sense', 'Continuity'],
    spans: [],
    correctSequence: [],
    fixSuggestion: correct ? null : `Aim for “${expected}” to restore the flow.`,
    nextHints: correct
      ? ['Try writing that beat into the passage to cement it.']
      : ['Name the emotion or action that would reset momentum.'],
    details: {
      message: correct ? 'Exactly the missing beat.' : `Expected “${expected}”.`,
      provided: inserted || null,
      expected,
      mode,
    },
  };
};

const gradeOrder = ({ item, answer, mode = 'order' }) => {
  const gold = normalizeStringList(item?.gold?.order);
  if (!gold.length) {
    return {
      score: 0.7,
      rubric: ['Sequence', 'Tempo'],
      spans: [],
      correctSequence: [],
      fixSuggestion: 'Focus on the pivot beat and let the rest fall around it.',
      nextHints: ['Track how tension rises—order follows that spine.'],
      details: { message: 'No canonical order provided; neutral score.', mode },
    };
  }

  const submitted = normalizeStringList(
    Array.isArray(answer?.order)
      ? answer.order
      : typeof answer === 'string'
        ? answer
        : answer?.sequence ?? []
  );

  const total = gold.length;
  let correct = 0;
  const misplacements = [];

  for (let i = 0; i < total; i += 1) {
    if (submitted[i] === gold[i]) {
      correct += 1;
    } else if (submitted[i]) {
      misplacements.push({ expected: gold[i], received: submitted[i] });
    }
  }

  const score = clampScore(total ? correct / total : 0);
  const fixSuggestion = score === 1 ? null : 'Rebuild the order around the midpoint reveal or reversal.';

  return {
    score,
    rubric: ['Sequence', 'Tempo'],
    spans: [],
    correctSequence: gold,
    fixSuggestion,
    nextHints: [
      score === 1 ? 'Run it once more, faster—lock the tempo.' : 'Compare each slot with the gold order and adjust the pivot beats.',
    ],
    details: {
      message: score === 1 ? 'Perfect sequence.' : `Placed ${correct} of ${total} beats correctly.`,
      provided: submitted,
      expected: gold,
      misplacements,
      mode,
    },
  };
};

const gradeHighlight = ({ item, answer, mode = 'highlight' }) => {
  const submittedSpans = normalizeSpans(Array.isArray(answer?.spans) ? answer.spans : answer?.spans ? [answer.spans] : []);
  const goldInput = item?.gold?.spans ?? [];
  const goldSpans = normalizeSpans(goldInput);

  if (!submittedSpans.length) {
    return {
      score: goldSpans.length ? 0.2 : 0.4,
      rubric: ['Coverage', 'Precision'],
      spans: [],
      correctSequence: [],
      fixSuggestion: 'Highlight the exact sentence where the tone or stakes flip.',
      nextHints: ['Scan for the moment pressure spikes or the reveal lands.'],
      details: { message: 'No spans submitted.', expectedSpans: goldSpans.length, mode },
    };
  }

  const passageLength = typeof item?.passage === 'string' ? item.passage.length : Number(item?.meta?.length ?? 0) || 0;
  const totalSubmission = submittedSpans.reduce((sum, span) => sum + (span.end - span.start), 0);

  if (!goldSpans.length) {
    const coverageRatio = passageLength ? Math.min(1, totalSubmission / Math.max(1, passageLength)) : 0.6;
    const score = clampScore(0.4 + coverageRatio * 0.5);
    return {
      score,
      rubric: ['Coverage', 'Precision'],
      spans: submittedSpans,
      correctSequence: [],
      fixSuggestion: score > 0.7 ? null : 'Tighten the highlight to the most charged sentence.',
      nextHints: ['Focus on the language shift—the reveal hides there.'],
      details: {
        message: 'Gold spans unavailable; grading by coverage.',
        coverage: coverageRatio,
        mode,
      },
    };
  }

  const goldTotal = goldSpans.reduce((sum, span) => sum + (span.end - span.start), 0);
  const overlapLength = submittedSpans.reduce((sum, span) => {
    let overlapSum = 0;
    for (const target of goldSpans) {
      const start = Math.max(span.start, target.start);
      const end = Math.min(span.end, target.end);
      if (end > start) {
        overlapSum += end - start;
      }
    }
    return sum + overlapSum;
  }, 0);

  const recall = goldTotal ? overlapLength / goldTotal : 0;
  const precision = totalSubmission ? overlapLength / totalSubmission : 0;
  const harmonic = recall + precision ? (2 * recall * precision) / (recall + precision) : 0;
  const score = clampScore(0.35 + harmonic * 0.65);

  return {
    score,
    rubric: ['Coverage', 'Precision'],
    spans: submittedSpans,
    correctSequence: [],
    fixSuggestion: precision < 0.65 ? 'Trim the highlight to the phrase doing the turn.' : null,
    nextHints: [
      recall < 0.8 ? 'Push the highlight further into the beat that lands the twist.' : 'Check that your highlight includes the precise verb or image.',
    ],
    details: {
      message: pickMessage(score, {
        high: 'Spot on—your highlight hugs the signal.',
        mid: 'Close! tighten around the key clause.',
        low: 'You brushed past the heat—zero in on the reveal.',
      }),
      recall,
      precision,
      mode,
    },
  };
};

const gradeFix = ({ item, answer, mode = 'fix' }) => {
  const choice = toLower(typeof answer === 'string' ? answer : answer?.choice ?? answer?.choiceId ?? '');
  const goldChoice = toLower(item?.gold?.choice ?? item?.gold?.choiceId ?? '');

  if (!goldChoice) {
    return {
      score: 0.7,
      rubric: ['Accuracy', 'Repair'],
      spans: [],
      correctSequence: [],
      fixSuggestion: 'Connect the stated issue to the option that resolves it.',
      nextHints: ['Match tone and stakes—right fix echoes both.'],
      details: { message: 'No gold choice set; awarding neutral score.', provided: choice || null, mode },
    };
  }

  const correct = choice === goldChoice;
  const score = clampScore(correct ? 1 : 0.25);

  return {
    score,
    rubric: ['Accuracy', 'Repair'],
    spans: [],
    correctSequence: [],
    fixSuggestion: correct ? null : `Key is “${goldChoice.toUpperCase()}”. Trace why the wrong beat fails.`,
    nextHints: [
      correct ? 'Take the win and move to the next beat.' : 'Underline the precise issue, then match the fix that patches it.',
    ],
    details: {
      message: correct ? 'Correct fix applied.' : `Gold answer: ${goldChoice || '—'}.`,
      provided: choice || null,
      expected: goldChoice || null,
      mode,
    },
  };
};

const handlers = {
  why: gradeWhy,
  name: gradeName,
  missing: gradeMissing,
  order: gradeOrder,
  highlight: gradeHighlight,
  fix: gradeFix,
};

export function grade(mode, payload = {}) {
  const cleanMode = SUPPORTED_MODES.includes(mode) ? mode : 'why';
  const handler = handlers[cleanMode] || handlers.why;
  let raw = {};

  try {
    raw = handler({ ...payload, mode: cleanMode }) || {};
  } catch (err) {
    console.error('[grader] failed to grade', cleanMode, err);
    raw = {};
  }

  const normalizedRubric = Array.isArray(raw.rubric) && raw.rubric.length ? raw.rubric : defaultRubric;
  const normalizedSpans = normalizeSpans(raw.spans);
  const normalizedHints = normalizeHints(raw.nextHints);
  const normalizedSequence = Array.isArray(raw.correctSequence)
    ? raw.correctSequence.map((entry) => String(entry || '')).filter(Boolean)
    : [];
  const fixSuggestion = raw.fixSuggestion ? String(raw.fixSuggestion) : null;

  const details = { ...defaultDetails(cleanMode), ...safeDetails(raw.details) };

  return {
    score: clampScore(Number(raw.score ?? 0)),
    rubric: normalizedRubric.map((entry) => String(entry)),
    spans: normalizedSpans,
    correctSequence: normalizedSequence,
    fixSuggestion,
    nextHints: normalizedHints,
    details,
    skillIds: Array.isArray(raw.skillIds) && raw.skillIds.length
      ? raw.skillIds.map((id) => String(id))
      : skillIdFallback(payload.item, cleanMode),
  };
}

export default grade;
