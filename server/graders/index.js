// server/graders/index.js (ESM)
// Deterministic graders for: name | missing | order | highlight | fix | why
// Each returns the normalized shape consumed by the UI and attempt route.

const BEAT_SYNONYMS = {
  action: ['act', 'move', 'do', 'beat:action'],
  decision: ['choice', 'decide', 'pick', 'beat:decision'],
  desire: ['want', 'goal', 'yearn', 'beat:desire'],
  conflict: ['clash', 'tension', 'problem', 'beat:conflict'],
  obstacle: ['block', 'barrier', 'resistance', 'beat:obstacle'],
  climax: ['peak', 'turning point', 'beat:climax'],
  resolution: ['after', 'denouement', 'resolve', 'beat:resolution'],
  reveal: ['discovery', 'find out', 'beat:reveal'],
  realization: ['insight', 'epiphany', 'beat:realization'],
  exposition: ['setup', 'context', 'beat:exposition'],
  foreshadow: ['hint', 'omen', 'beat:foreshadow'],
  setup: ['plant', 'seed', 'beat:setup'],
  payoff: ['result', 'payoff', 'beat:payoff'],
  emotion: ['feeling', 'affect', 'beat:emotion'],
  suppression: ['hide', 'mask', 'beat:suppression'],
  vulnerability: ['soft spot', 'open', 'beat:vulnerability'],
  power: ['status', 'leverage', 'beat:power'],
  shift: ['turn', 'pivot', 'beat:shift'],
  intimacy: ['closeness', 'tender', 'beat:intimacy'],
  alienation: ['distance', 'cold', 'beat:alienation'],
  dialogue: ['talk', 'speak', 'line', 'beat:dialogue'],
  nonverbal: ['gesture', 'look', 'silence', 'beat:nonverbal'],
  interaction: ['exchange', 'back-and-forth', 'beat:interaction'],
  agreement: ['deal', 'sign', 'beat:agreement'],
  disagreement: ['argue', 'refuse', 'beat:disagreement'],
  test: ['trial', 'prove', 'beat:test'],
  reversal: ['flip', 'invert', 'beat:reversal'],
  atmosphere: ['mood', 'texture', 'beat:atmosphere'],
  discovery: ['learn', 'uncover', 'beat:discovery'],
  loss: ['grief', 'missing', 'beat:loss'],
  arrival: ['enter', 'show up', 'beat:arrival'],
  departure: ['leave', 'exit', 'beat:departure'],
  transition: ['cut', 'jump', 'beat:transition'],
};

const RATIONALE_KEYWORDS = {
  emotional: ['feeling', 'emotion', 'tone', 'mood', 'affect'],
  'money/class': ['money', 'rent', 'bill', 'class', 'status', 'work'],
  process: ['because', 'so that', 'therefore', 'in order to', 'method'],
  'voice/style': ['voice', 'style', 'diction', 'cadence', 'rhythm', 'syntax'],
  clarity: ['clear', 'confusing', 'ambiguous', 'specific'],
  stakes: ['stakes', 'risk', 'cost', 'consequence'],
  motive: ['motive', 'want', 'goal', 'desire', 'because'],
};

// ---------- small utilities ----------
const toArray = (x) => Array.isArray(x) ? x : (x == null ? [] : [x]);
const uniq = (arr) => Array.from(new Set(arr));
const clamp01 = (n) => Math.max(0, Math.min(1, n));

function extractBeatsFromAnswer(answer) {
  // Supports either structured {beats:[], sigils:[]} or free text with [BEAT] tags
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
    // also try a very light keyword sniff for common beats
    for (const [beat, syns] of Object.entries(BEAT_SYNONYMS)) {
      const hay = answer.toLowerCase();
      if (hay.includes(beat) || syns.some(s => hay.includes(s))) beats.add(beat);
    }
  }
  return Array.from(beats);
}

function canonBeat(b) {
  const k = String(b || '').toLowerCase().trim();
  if (!k) return '';
  // map synonyms → canonical label if close enough
  for (const [canon, syns] of Object.entries(BEAT_SYNONYMS)) {
    if (k === canon) return canon;
    if (syns.some(s => k.includes(s))) return canon;
  }
  return k;
}

function kendallTauNormalized(a = [], b = []) {
  // Kendall tau distance normalized to [0..1], where 1 = perfect, 0 = completely inverted/random
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
  return clamp01((tau + 1) / 2); // map [-1..1] → [0..1]
}

function charOverlapScore(goldSpans = [], userSpans = []) {
  // gold/user spans: [{start,end}]
  const cover = (spans) => {
    const set = new Set();
    spans.forEach(({ start, end }) => {
      for (let i = Math.max(0, start|0); i < Math.max(0, end|0); i++) set.add(i);
    });
    return set;
  };
  const G = cover(goldSpans), U = cover(userSpans);
  if (G.size === 0) return 0;
  let inter = 0;
  U.forEach(i => { if (G.has(i)) inter++; });
  return clamp01(inter / G.size);
}

function pick(arr, n = 1) {
  if (!arr?.length) return [];
  const out = [];
  for (let i = 0; i < n; i++) out.push(arr[i % arr.length]);
  return out;
}

// ---------- graders ----------
function gradeName(item, answer) {
  const goldBeats = uniq([
    ...toArray(item?.gold?.beats),
    ...toArray(item?.meta?.beat_tags),
  ].map(canonBeat).filter(Boolean));

  const userBeats = uniq(extractBeatsFromAnswer(answer).map(canonBeat).filter(Boolean));

  const hits = userBeats.filter(b => goldBeats.includes(b));
  const near = userBeats.filter(b => !goldBeats.includes(b) && goldBeats.some(g => (BEAT_SYNONYMS[g]||[]).some(s => b.includes(s))));
  const miss = goldBeats.filter(b => !userBeats.includes(b));

  const denom = Math.max(1, goldBeats.length);
  const score = clamp01((hits.length + 0.5 * near.length) / denom);

  const rubric = [];
  if (hits.length) rubric.push(`Matched: ${hits.join(', ')}`);
  if (near.length) rubric.push(`Near-miss: ${near.join(', ')}`);
  if (miss.length) rubric.push(`Missing: ${miss.join(', ')}`);

  const nextHints = miss.length ? [`Scan for: ${pick(miss, 3).join(', ')}`] : ['Try adding a Reveal 👁️ before the Payoff 🎉.'];

  return { score, rubric, spans: [], correctSequence: [], fixSuggestion: null, nextHints, details: { goldBeats, userBeats, hits, near, miss, mode: 'name' } };
}

function gradeMissing(item, answer) {
  // Expect: item.gold.expectedBeats (full set) and the user supplies a single beat to insert
  const expected = uniq(toArray(item?.gold?.expectedBeats).map(canonBeat).filter(Boolean));
  const provided = (() => {
    if (typeof answer === 'object') {
      const one = toArray(answer.insert)?.[0] ?? toArray(answer.beats)?.[0] ?? toArray(answer.sigils)?.[0];
      if (one) return canonBeat(one);
      if (typeof answer.text === 'string') {
        const m = answer.text.match(/\[([A-Z][A-Z]+)\]/);
        if (m) return canonBeat(m[1]);
      }
    } else if (typeof answer === 'string') {
      const m = answer.match(/\[([A-Z][A-Z]+)\]/);
      if (m) return canonBeat(m[1]);
    }
    return '';
  })();

  const missing = expected.filter(b => b && !toArray(item?.gold?.presentBeats).map(canonBeat).includes(b));
  const ok = provided && missing.includes(provided);
  const near = provided && !ok && missing.some(g => (BEAT_SYNONYMS[g]||[]).some(s => provided.includes(s)));

  const score = ok ? 1 : near ? 0.5 : 0;
  const rubric = ok ? ['Inserted the strongest missing beat.'] :
                near ? [`Close! Consider: ${pick(missing, 2).join(', ')}`] :
                       ['Pick the beat that would complete the moment.'];

  const nextHints = ok ? ['Now escalate toward Payoff 🎉.'] : [`Look for the void: ${pick(missing, 1).join('')||'the hinge beat'}.`];

  return { score, rubric, spans: [], correctSequence: [], fixSuggestion: ok ? null : 'Name the beat gap you’re repairing.', nextHints, details: { expected, missing, provided, mode: 'missing' } };
}

function gradeOrder(item, answer) {
  const gold = toArray(item?.gold?.order).map(String);
  const user = (() => {
    if (typeof answer === 'object') return toArray(answer.order).map(String);
    if (typeof answer === 'string') {
      // allow comma/space-separated ids
      return answer.split(/[,\s]+/).filter(Boolean);
    }
    return [];
  })();

  const score = kendallTauNormalized(gold, user);
  const rubric = [];
  const correctSequence = gold;

  if (gold.length && user.length) {
    const wrongEdges = [];
    // find violating adjacent pairs in user wrt gold
    const pos = new Map(gold.map((id, i) => [id, i]));
    for (let i = 0; i < user.length - 1; i++) {
      const a = user[i], b = user[i+1];
      if (pos.has(a) && pos.has(b) && pos.get(a) > pos.get(b)) {
        wrongEdges.push([a,b]);
      }
    }
    if (wrongEdges.length) rubric.push(`Out of order: ${wrongEdges.slice(0,3).map(([a,b])=>`${a}→${b}`).join(' | ')}`);
  }

  const nextHints = score < 1 ? ['Anchor Setup 🎯 before Payoff 🎉; keep Reveal 👁️ close to the turn.'] : ['Clean chain. Ready to speed up the cadence.'];

  return { score, rubric, spans: [], correctSequence, fixSuggestion: score < 1 ? 'Swap the violating pair(s) first.' : null, nextHints, details: { gold, user, mode: 'order' } };
}

function gradeHighlight(item, answer) {
  const goldSpans = toArray(item?.gold?.spans).map(s => ({ start: s.start|0, end: s.end|0 })).filter(s => s.end > s.start);
  const userSpans = (() => {
    if (typeof answer === 'object') return toArray(answer.spans).map(s => ({ start: s.start|0, end: s.end|0 })).filter(s => s.end > s.start);
    return [];
  })();

  const score = charOverlapScore(goldSpans, userSpans);
  const rubric = [score >= 0.9 ? 'Great coverage.' : score >= 0.6 ? 'Partial overlap.' : 'Missed the signal span.'];
  const nextHints = score < 0.9 ? ['Zoom into verbs and hinge words; highlight the exact trigger.'] : ['Try a tighter span next time.'];

  return { score, rubric, spans: goldSpans, correctSequence: [], fixSuggestion: score < 0.6 ? 'Re-read the cue line; highlight just the mechanism.' : null, nextHints, details: { goldSpans, userSpans, mode: 'highlight' } };
}

function gradeFix(item, answer) {
  // MCQ: correct key in item.gold.key or item.gold.correct
  const key = String(item?.gold?.key ?? item?.gold?.correct ?? '').trim();
  const nearMiss = new Set(toArray(item?.gold?.nearMiss));
  const choice = (() => {
    if (typeof answer === 'object') return String(answer.choice ?? answer.id ?? '').trim();
    if (typeof answer === 'string') return answer.trim();
    return '';
  })();

  let score = 0;
  if (choice && key && choice === key) score = 1;
  else if (choice && nearMiss.has(choice)) score = 0.5;

  const rubric = score === 1 ? ['Right fix: precise and minimal.'] :
                 score === 0.5 ? ['Close fix: watch for clarity or rule edge cases.'] :
                 ['Pick the option that removes error without adding style noise.'];

  const nextHints = score === 1
    ? ['Try the more subtle pair next round.']
    : ['Check for label-y emotion, over-explain, or speechy theme—trim accordingly.'];

  const fixSuggestion = score === 1 ? null : 'Prefer the smallest change that resolves the issue.';

  return { score, rubric, spans: [], correctSequence: [], fixSuggestion, nextHints, details: { key, choice, nearMiss: Array.from(nearMiss), mode: 'fix' } };
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

  const hits = [];
  for (const tag of goldTags) {
    const kws = RATIONALE_KEYWORDS[tag] || [];
    if (kws.some(k => hay.includes(k))) hits.push(tag);
  }

  // heuristic: length helps a tiny bit (but not gating!)
  const wordCount = (text.trim().match(/\S+/g) || []).length;
  const lcBoost = Math.min(0.15, (wordCount >= 25 ? 0.15 : wordCount / 25 * 0.15));

  const base = goldTags.length ? (hits.length / goldTags.length) : 0.6; // if no tags, be generous
  const score = clamp01(base + lcBoost);

  const rubric = [];
  if (hits.length) rubric.push(`Addresses: ${hits.join(', ')}`);
  const miss = goldTags.filter(t => !hits.includes(t));
  if (miss.length) rubric.push(`Could add: ${pick(miss, 2).join(', ')}`);

  const nextHints = miss.length
    ? [`Tie motive to stakes explicitly (e.g., "because …, so …").`]
    : ['Add one concrete sentence that shows consequence, not label.'];

  return { score, rubric, spans: [], correctSequence: [], fixSuggestion: null, nextHints, details: { goldTags, hits, wordCount, mode: 'why' } };
}

// ---------- public API ----------
export async function grade({ mode, item, answer }) {
  const m = String(mode || item?.mode || '').toLowerCase();
  try {
    switch (m) {
      case 'name':       return gradeName(item, answer);
      case 'missing':    return gradeMissing(item, answer);
      case 'order':      return gradeOrder(item, answer);
      case 'highlight':  return gradeHighlight(item, answer);
      case 'fix':        return gradeFix(item, answer);
      case 'why':        return gradeWhy(item, answer);
      default:
        return {
          score: 0,
          rubric: ['Unknown mode.'],
          spans: [],
          correctSequence: [],
          fixSuggestion: null,
          nextHints: ['Pick a supported mode: name, missing, order, highlight, fix, why.'],
          details: { mode: m, error: 'unsupported-mode' },
        };
    }
  } catch (e) {
    return {
      score: 0,
      rubric: ['Grader error — returning safe fallback.'],
      spans: [],
      correctSequence: [],
      fixSuggestion: null,
      nextHints: ['Try again; if persists, see logs.'],
      details: { mode: m, error: String(e?.message || e) },
    };
  }
}

export default { grade };
