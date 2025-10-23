// server/graders/index.js (ESM)
// Normalized graders for name | missing | order | highlight | fix | why
// Always return the complete shape:
// { score, rubric:[], spans:[], correctSequence:[], fixSuggestion, nextHints:[], details:{} }

const clamp01 = (n) => Math.max(0, Math.min(1, Number.isFinite(n) ? n : 0));

const SHAPE_DEFAULT = Object.freeze({
  score: 0,
  rubric: [],
  spans: [],
  correctSequence: [],
  fixSuggestion: null,
  nextHints: [],
  details: {},
});

function ensureShape(result, extra = {}) {
  const r = result || {};
  return {
    score: clamp01(r.score ?? 0),
    rubric: Array.isArray(r.rubric) ? r.rubric : [],
    spans: Array.isArray(r.spans) ? r.spans : [],
    correctSequence: Array.isArray(r.correctSequence) ? r.correctSequence : [],
    fixSuggestion: r.fixSuggestion ?? null,
    nextHints: Array.isArray(r.nextHints) ? r.nextHints : [],
    details: typeof r.details === 'object' && r.details !== null ? r.details : {},
    ...extra,
  };
}

// Normalizer ensures the /api/attempt contract is always satisfied.
function normalizeResult(r = {}, { userId = 'anon', itemId = null, mode = 'why' } = {}) {
  const now = new Date().toISOString();
  const normalizedUserId = typeof r.userId === 'string' && r.userId.trim()
    ? r.userId.trim()
    : (typeof userId === 'string' && userId.trim() ? userId.trim() : 'anon');
  const itemIdSource = r.itemId ?? itemId;
  const normalizedItemId = itemIdSource == null ? null : String(itemIdSource);
  const modeSource = typeof r.mode === 'string' && r.mode.trim()
    ? r.mode.trim()
    : (typeof mode === 'string' && mode.trim() ? mode.trim() : 'why');
  const gradedAtValue = r.gradedAt;
  let gradedAt = now;
  if (typeof gradedAtValue === 'string' && gradedAtValue.trim()) {
    gradedAt = gradedAtValue;
  } else if (gradedAtValue instanceof Date && !Number.isNaN(gradedAtValue.valueOf())) {
    gradedAt = gradedAtValue.toISOString();
  }
  const numericScore = Number(r.score);
  const score = Number.isFinite(numericScore) ? clamp01(numericScore) : 0.0;
  const levelValue = Number(r.level);
  const level = Number.isFinite(levelValue) ? levelValue : 1;
  const detailsValue = (r.details && typeof r.details === 'object' && !Array.isArray(r.details)) ? r.details : {};

  return {
    ok: typeof r.ok === 'boolean' ? r.ok : true,
    userId: normalizedUserId,
    itemId: normalizedItemId,
    mode: modeSource,
    score,
    rubric: Array.isArray(r.rubric) ? r.rubric : [],
    spans: Array.isArray(r.spans) ? r.spans : [],
    correctSequence: Array.isArray(r.correctSequence) ? r.correctSequence : [],
    fixSuggestion: r.fixSuggestion ?? null,
    nextHints: Array.isArray(r.nextHints) ? r.nextHints : [],
    details: detailsValue,
    leveledUp: !!r.leveledUp,
    level,
    badges: Array.isArray(r.badges) ? r.badges : [],
    gradedAt,
  };
}

// --- light helpers used by graders ---
const toArray = (x) => Array.isArray(x) ? x : (x == null ? [] : [x]);
const uniq = (arr) => Array.from(new Set(arr));
const BEAT_SYNONYMS = {
  action: ['act', 'move', 'do'],
  decision: ['choice', 'decide', 'pick'],
  desire: ['want', 'goal', 'yearn'],
  conflict: ['clash', 'tension', 'problem'],
  obstacle: ['block', 'barrier', 'resistance'],
  climax: ['peak', 'turning point'],
  resolution: ['denouement', 'resolve'],
  reveal: ['discovery', 'find out'],
  realization: ['insight', 'epiphany'],
  exposition: ['setup', 'context'],
  foreshadow: ['hint', 'omen'],
  setup: ['plant', 'seed'],
  payoff: ['result'],
  emotion: ['feeling', 'affect'],
  suppression: ['hide', 'mask'],
  vulnerability: ['open', 'soft spot'],
  power: ['status', 'leverage'],
  shift: ['turn', 'pivot'],
  intimacy: ['closeness', 'tender'],
  alienation: ['distance', 'cold'],
  dialogue: ['talk', 'speak', 'line'],
  nonverbal: ['gesture', 'look', 'silence'],
  interaction: ['exchange', 'back-and-forth'],
  agreement: ['deal', 'sign'],
  disagreement: ['argue', 'refuse'],
  test: ['trial', 'prove'],
  reversal: ['flip', 'invert'],
  atmosphere: ['mood', 'texture'],
  discovery: ['learn', 'uncover'],
  loss: ['grief', 'missing'],
  arrival: ['enter', 'show up'],
  departure: ['leave', 'exit'],
  transition: ['cut', 'jump'],
};

function canonBeat(b) {
  const k = String(b || '').toLowerCase().trim();
  if (!k) return '';
  if (BEAT_SYNONYMS[k]) return k;
  for (const [canon, syns] of Object.entries(BEAT_SYNONYMS)) {
    if (k === canon) return canon;
    if (syns.some(s => k.includes(s))) return canon;
  }
  return k;
}

function extractBeatsFromAnswer(answer) {
  const beats = new Set();
  if (!answer) return [];
  if (typeof answer === 'object') {
    toArray(answer.beats).forEach(b => beats.add(String(b).toLowerCase()));
    toArray(answer.sigils).forEach(s => beats.add(String(s).toLowerCase()));
    if (typeof answer.text === 'string') {
      (answer.text.match(/\[([A-Z][A-Z]+)\]/g) || []).forEach(t => beats.add(t.slice(1, -1).toLowerCase()));
    }
  } else if (typeof answer === 'string') {
    (answer.match(/\[([A-Z][A-Z]+)\]/g) || []).forEach(t => beats.add(t.slice(1, -1).toLowerCase()));
    // keyword sniff:
    for (const [beat, syns] of Object.entries(BEAT_SYNONYMS)) {
      const hay = answer.toLowerCase();
      if (hay.includes(beat) || syns.some(s => hay.includes(s))) beats.add(beat);
    }
  }
  return Array.from(beats).map(canonBeat).filter(Boolean);
}

function kendallTauNormalized(a = [], b = []) {
  const n = Math.min(a.length, b.length);
  if (n <= 1) return 1;
  const pa = new Map(a.map((id, i) => [id, i]));
  const pb = new Map(b.map((id, i) => [id, i]));
  const common = a.filter((id) => pb.has(id));
  let discordant = 0, total = 0;
  for (let i = 0; i < common.length; i++) {
    for (let j = i + 1; j < common.length; j++) {
      const x = common[i], y = common[j];
      const signA = Math.sign(pa.get(x) - pa.get(y));
      const signB = Math.sign(pb.get(x) - pb.get(y));
      if (signA !== signB) discordant++;
      total++;
    }
  }
  if (total === 0) return 1;
  const tau = 1 - (2 * discordant) / (common.length * (common.length - 1));
  return clamp01((tau + 1) / 2);
}

function charOverlapScore(goldSpans = [], userSpans = []) {
  const g = new Set();
  for (const s of goldSpans) for (let i = (s.start | 0); i < (s.end | 0); i++) g.add(i);
  const u = new Set();
  for (const s of userSpans) for (let i = (s.start | 0); i < (s.end | 0); i++) u.add(i);
  if (g.size === 0) return 0;
  let inter = 0; u.forEach(i => { if (g.has(i)) inter++; });
  return clamp01(inter / g.size);
}

// ----------------- individual graders -----------------
function gradeName(item, answer) {
  const goldBeats = uniq([
    ...toArray(item?.gold?.beats),
    ...toArray(item?.meta?.beat_tags),
  ].map(canonBeat).filter(Boolean));

  const userBeats = uniq(extractBeatsFromAnswer(answer));

  const hits = userBeats.filter(b => goldBeats.includes(b));
  const near = userBeats.filter(b => !goldBeats.includes(b) &&
    goldBeats.some(g => ((BEAT_SYNONYMS[g] || []).some(s => b.includes(s))))
  );
  const miss = goldBeats.filter(b => !userBeats.includes(b));

  const denom = Math.max(1, goldBeats.length);
  const score = clamp01((hits.length + 0.5 * near.length) / denom);

  return ensureShape({
    score,
    rubric: [
      hits.length ? `Matched: ${hits.join(', ')}` : 'No direct matches.',
      near.length ? `Near-miss: ${near.join(', ')}` : null,
      miss.length ? `Missing: ${miss.join(', ')}` : null,
    ].filter(Boolean),
    nextHints: miss.length ? [`Scan for: ${miss.slice(0, 3).join(', ')}`] : ['Try adding a Reveal 👁️ before the Payoff 🎉.'],
    details: { mode: 'name', goldBeats, userBeats, hits, near, miss },
  });
}

function gradeMissing(item, answer) {
  const expected = uniq(toArray(item?.gold?.expectedBeats).map(canonBeat).filter(Boolean));
  const present = uniq(toArray(item?.gold?.presentBeats).map(canonBeat).filter(Boolean));
  const missing = expected.filter(b => !present.includes(b));

  let provided = '';
  if (typeof answer === 'object') {
    provided = canonBeat(toArray(answer.insert)?.[0] ?? toArray(answer.beats)?.[0] ?? '');
    if (!provided && typeof answer.text === 'string') {
      const m = answer.text.match(/\[([A-Z][A-Z]+)\]/);
      if (m) provided = canonBeat(m[1]);
    }
  } else if (typeof answer === 'string') {
    const m = answer.match(/\[([A-Z][A-Z]+)\]/);
    if (m) provided = canonBeat(m[1]);
  }

  const ok = provided && missing.includes(provided);
  const near = provided && !ok && missing.some(g => (BEAT_SYNONYMS[g] || []).some(s => provided.includes(s)));
  const score = ok ? 1 : near ? 0.5 : 0;

  return ensureShape({
    score,
    rubric: ok
      ? ['Inserted the strongest missing beat.']
      : near
        ? [`Close! Consider: ${missing.slice(0, 2).join(', ')}`]
        : ['Pick the beat that completes the moment.'],
    fixSuggestion: ok ? null : 'Name the beat gap you’re repairing.',
    nextHints: ok ? ['Now escalate toward Payoff 🎉.'] : [`Look for the void: ${missing[0] || 'the hinge beat'}.`],
    details: { mode: 'missing', expected, present, missing, provided },
  });
}

function gradeOrder(item, answer) {
  const gold = toArray(item?.gold?.order).map(String);
  const user = (() => {
    if (typeof answer === 'object') return toArray(answer.order).map(String);
    if (typeof answer === 'string') return answer.split(/[\,\s]+/).filter(Boolean);
    return [];
  })();

  const score = kendallTauNormalized(gold, user);
  const pos = new Map(gold.map((id, i) => [id, i]));
  const wrong = [];
  for (let i = 0; i < user.length - 1; i++) {
    const a = user[i], b = user[i + 1];
    if (pos.has(a) && pos.has(b) && pos.get(a) > pos.get(b)) wrong.push([a, b]);
  }

  return ensureShape({
    score,
    rubric: wrong.length ? [`Out of order: ${wrong.slice(0, 3).map(([a, b]) => `${a}→${b}`).join(' | ')}`] : ['Sequence looks consistent.'],
    correctSequence: gold,
    fixSuggestion: score < 1 ? 'Swap the violating pair(s) first.' : null,
    nextHints: score < 1 ? ['Keep Reveal 👁️ close to the turn; place Payoff 🎉 after Setup 🎯.'] : ['Clean chain. Ready to speed up the cadence.'],
    details: { mode: 'order', gold, user, wrong },
  });
}

function gradeHighlight(item, answer) {
  const goldSpans = toArray(item?.gold?.spans).map(s => ({ start: s.start | 0, end: s.end | 0 })).filter(s => s.end > s.start);
  const userSpans = typeof answer === 'object'
    ? toArray(answer.spans).map(s => ({ start: s.start | 0, end: s.end | 0 })).filter(s => s.end > s.start)
    : [];

  const overlap = charOverlapScore(goldSpans, userSpans);
  return ensureShape({
    score: overlap,
    rubric: [overlap >= 0.9 ? 'Great coverage.' : overlap >= 0.6 ? 'Partial overlap.' : 'Missed the signal span.'],
    spans: goldSpans,
    fixSuggestion: overlap < 0.6 ? 'Re-read the cue line; highlight just the mechanism.' : null,
    nextHints: overlap < 0.9 ? ['Zoom into verbs and hinge words; highlight the exact trigger.'] : ['Try a tighter span next time.'],
    details: { mode: 'highlight', goldSpans, userSpans, overlap },
  });
}

function gradeFix(item, answer) {
  const key = String(item?.gold?.key ?? item?.gold?.correct ?? '').trim();
  const nearMiss = new Set(toArray(item?.gold?.nearMiss));
  const choice = (typeof answer === 'object')
    ? String(answer.choice ?? answer.id ?? '').trim()
    : (typeof answer === 'string' ? answer.trim() : '');

  let score = 0;
  if (choice && key && choice === key) score = 1;
  else if (choice && nearMiss.has(choice)) score = 0.5;

  return ensureShape({
    score,
    rubric: score === 1 ? ['Right fix: precise and minimal.']
      : score === 0.5 ? ['Close fix: watch for clarity or rule edge cases.']
        : ['Pick the option that removes error without adding style noise.'],
    fixSuggestion: score === 1 ? null : 'Prefer the smallest change that resolves the issue.',
    nextHints: score === 1 ? ['Try the subtler pair next round.']
      : ['Check for label-y emotion, over-explain, or speechy theme—trim accordingly.'],
    details: { mode: 'fix', key, choice, nearMiss: Array.from(nearMiss) },
  });
}

function gradeWhy(item, answer) {
  const goldTags = uniq(
    toArray(item?.gold?.rationaleTags ?? item?.meta?.rationaleTags)
      .flatMap(t => String(t).split(/[;,]/))
      .map(s => s.trim().toLowerCase())
      .filter(Boolean)
  );
  const text = typeof answer === 'object' ? String(answer.rationale ?? answer.text ?? '') : String(answer ?? '');
  const hay = text.toLowerCase();

  const TAGS = {
    emotional: ['feeling', 'emotion', 'tone', 'mood', 'affect'],
    'money/class': ['money', 'rent', 'bill', 'class', 'status', 'work'],
    process: ['because', 'so that', 'therefore', 'in order to', 'method'],
    'voice/style': ['voice', 'style', 'diction', 'cadence', 'rhythm', 'syntax'],
    clarity: ['clear', 'confusing', 'ambiguous', 'specific'],
    stakes: ['stakes', 'risk', 'cost', 'consequence'],
    motive: ['motive', 'want', 'goal', 'desire', 'because'],
  };

  const hits = [];
  for (const tag of goldTags) {
    const kws = TAGS[tag] || [];
    if (kws.some(k => hay.includes(k))) hits.push(tag);
  }

  const wordCount = (text.trim().match(/\S+/g) || []).length;
  const lcBoost = Math.min(0.15, (wordCount >= 25 ? 0.15 : (wordCount / 25) * 0.15));
  const base = goldTags.length ? (hits.length / goldTags.length) : 0.6;
  const score = clamp01(base + lcBoost);

  return ensureShape({
    score,
    rubric: [
      hits.length ? `Addresses: ${hits.join(', ')}` : 'State motive and consequence explicitly.',
      ...((goldTags.filter(t => !hits.includes(t)).length)
        ? [`Could add: ${goldTags.filter(t => !hits.includes(t)).slice(0, 2).join(', ')}`]
        : [])
    ],
    nextHints: (goldTags.length && hits.length < goldTags.length)
      ? ['Tie motive to stakes: “because …, so …”.']
      : ['Add one concrete sentence that shows consequence, not label.'],
    details: { mode: 'why', goldTags, hits, wordCount },
  });
}


// Internal grader implementation
async function _grade({ mode, item, answer }) {
  const m = String(mode || item?.mode || '').toLowerCase();
  try {
    switch (m) {
      case 'name': return ensureShape(gradeName(item, answer));
      case 'missing': return ensureShape(gradeMissing(item, answer));
      case 'order': return ensureShape(gradeOrder(item, answer));
      case 'highlight': return ensureShape(gradeHighlight(item, answer));
      case 'fix': return ensureShape(gradeFix(item, answer));
      case 'why': return ensureShape(gradeWhy(item, answer));
      default:
        return ensureShape({
          rubric: ['Unknown mode.'],
          nextHints: ['Use one of: name, missing, order, highlight, fix, why.'],
          details: { error: 'unsupported-mode', mode: m },
        });
    }
  } catch (e) {
    return ensureShape({
      rubric: ['Grader error — safe fallback.'],
      nextHints: ['Try again; if persists, see server logs.'],
      details: { error: String(e?.message || e), mode: m },
    });
  }
}

// Public API: wrapper that coerces mode and normalizes output
export async function grade(mode, payload) {
  const allowedModes = new Set(["name", "missing", "order", "highlight", "fix", "why", "sigil"]);
  const coerced = allowedModes.has((mode ?? "").toString().toLowerCase()) ? (mode ?? "").toString().toLowerCase() : "why";
  const basePayload = { ...(payload || {}), mode: coerced };
  const raw = await _grade(basePayload);
  // Normalize output
  const now = new Date().toISOString();
  return {
    ok: true,
    userId: basePayload.userId ?? raw.userId ?? "anon",
    itemId: basePayload.itemId ?? raw.itemId ?? null,
    mode: coerced,
    score: typeof raw.score === "number" ? raw.score : 0.0,
    rubric: Array.isArray(raw.rubric) ? raw.rubric : [],
    spans: Array.isArray(raw.spans) ? raw.spans : [],
    correctSequence: Array.isArray(raw.correctSequence) ? raw.correctSequence : [],
    fixSuggestion: raw.fixSuggestion ?? null,
    nextHints: Array.isArray(raw.nextHints) ? raw.nextHints : [],
    details: (raw.details && typeof raw.details === "object") ? raw.details : {},
    leveledUp: !!raw.leveledUp,
    level: Number.isFinite(raw.level) ? raw.level : 1,
    badges: Array.isArray(raw.badges) ? raw.badges : [],
    gradedAt: typeof raw.gradedAt === "string" ? raw.gradedAt : now
  };
}

export default { grade };
