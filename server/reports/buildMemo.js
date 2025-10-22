const pct = (value) => `${Math.round((value || 0) * 100)}%`;

const NEIGHBORS = ['Hemingway', 'Baldwin', 'Didion', 'Morrison', 'Le Guin', 'Okorafor', 'Ng', 'Martín', 'Díaz'];
const FOILS = ['PurpleProse', 'TEDTalk', 'Corporate Memo', 'Soapbox', 'Infomercial', 'Algorithmic Voice'];

const verdictForAverage = (avg) => {
  if (avg >= 0.9) return 'Verdict: Razor-sharp craft—heat with control.';
  if (avg >= 0.75) return 'Verdict: Confident moves with flashes of fire.';
  if (avg >= 0.6) return 'Verdict: Groove emerging—keep stacking deliberate reps.';
  return 'Verdict: Experimental energy—tighten fundamentals to channel it.';
};

const trendLabel = (recent, earlier) => {
  if (!Number.isFinite(recent) || !Number.isFinite(earlier)) return 'steady';
  const delta = recent - earlier;
  if (delta > 0.05) return 'rising';
  if (delta < -0.05) return 'dipping';
  return 'steady';
};

const averageScore = (list) => {
  if (!list.length) return 0;
  const total = list.reduce((sum, value) => sum + (Number(value) || 0), 0);
  return total / list.length;
};

const summarizeRubrics = (attempts) => {
  const store = new Map();
  for (const attempt of attempts) {
    const labels = Array.isArray(attempt?.rubric) ? attempt.rubric : [];
    const score = Number(attempt?.score ?? 0);
    for (const label of labels) {
      const key = String(label);
      if (!store.has(key)) {
        store.set(key, { total: 0, strong: 0, weak: 0 });
      }
      const entry = store.get(key);
      entry.total += 1;
      if (score >= 0.75) entry.strong += 1;
      if (score <= 0.5) entry.weak += 1;
    }
  }

  const strong = [...store.entries()]
    .filter(([, entry]) => entry.total > 0)
    .sort((a, b) => (b[1].strong / b[1].total) - (a[1].strong / a[1].total))
    .slice(0, 2)
    .map(([label]) => label);

  const shaky = [...store.entries()]
    .filter(([, entry]) => entry.weak > 0)
    .sort((a, b) => (b[1].weak / b[1].total) - (a[1].weak / a[1].total))
    .slice(0, 2)
    .map(([label]) => label);

  return { strong, shaky };
};

const summarizeModes = (attempts) => {
  const counts = new Map();
  for (const attempt of attempts) {
    const mode = String(attempt?.mode || 'why');
    counts.set(mode, (counts.get(mode) || 0) + 1);
  }
  const ordered = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  return ordered.map(([mode]) => mode);
};

const pickFromList = (source, seed, count) => {
  const out = [];
  if (!source.length || count <= 0) return out;
  let index = Math.abs(seed) % source.length;
  for (let i = 0; i < count; i += 1) {
    out.push(source[index % source.length]);
    index += 1 + ((seed >> (i % 8)) & 0x3);
  }
  return out;
};

export function buildMemo({ userId = 'dev', attempts = [], mastery }) {
  const totalAttempts = attempts.length;
  const allScores = attempts.map((attempt) => Number(attempt?.score ?? 0));
  const avgScore = averageScore(allScores);
  const recentSlice = attempts.slice(0, 5);
  const earlierSlice = attempts.slice(5, 10);
  const recentAvg = averageScore(recentSlice.map((attempt) => Number(attempt?.score ?? 0)));
  const earlierAvg = averageScore(earlierSlice.map((attempt) => Number(attempt?.score ?? 0)));
  const trend = trendLabel(recentAvg, earlierAvg);
  const { strong, shaky } = summarizeRubrics(attempts);
  const modeOrder = summarizeModes(attempts);

  const verdict = verdictForAverage(avgScore);
  const bulletLines = [];
  bulletLines.push(`- Avg score ${pct(avgScore)} across ${totalAttempts || 0} attempts; trend is ${trend}.`);

  if (strong.length || shaky.length) {
    const reliable = strong.length ? strong.join(' • ') : 'still forming';
    const watch = shaky.length ? shaky.join(' • ') : 'hold steady';
    bulletLines.push(`- Reliable: ${reliable}; Watch: ${watch}.`);
  } else {
    bulletLines.push('- Rubric signal still forming—log a few more graded reps.');
  }

  if (modeOrder.length) {
    const favorites = modeOrder.slice(0, 3).join(', ');
    bulletLines.push(`- Modes in rotation: ${favorites}.`);
  }

  if (mastery) {
    bulletLines.push(`- Level ${mastery.level || 1} • Total EXP ${mastery.totalExp || 0}.`);
  }

  const weakestCue = shaky[0] || strong[0] || 'Clarity';
  const nextMode = modeOrder.at(-1) || modeOrder[0] || 'why';
  const drillLine = `What to try next: Run a ${nextMode} rep that spotlights ${weakestCue} in three sentences.`;

  const seed = (userId || '').split('').reduce((acc, char, idx) => acc + char.charCodeAt(0) * (idx + 1), 0);
  const neighborList = pickFromList(NEIGHBORS, seed, 3);
  const foilList = pickFromList(FOILS, seed >> 3, 2);
  const influenceLine = `Neighbors: ${neighborList.join(' • ')}; Foils: ${foilList.join(' • ')}.`;

  const lines = [verdict, ...bulletLines.slice(0, 4), drillLine, influenceLine];

  return {
    title: 'Professor Ray Ray: Style Notes',
    body: lines.join('\n'),
    level: mastery?.level ?? 1,
    issuedAt: new Date().toISOString(),
  };
}

export default buildMemo;
