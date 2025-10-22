import fs from 'node:fs';
import path from 'node:path';

const CWD = process.cwd();
const DATA_DIR_CANDIDATES = [
  path.join(CWD, 'server', 'db', 'data'),
  path.join(CWD, 'db', 'data'),
];

const getAttemptsPath = () => {
  for (const dir of DATA_DIR_CANDIDATES) {
    const file = path.join(dir, 'attempts.jsonl');
    if (fs.existsSync(file)) return file;
  }
  return path.join(DATA_DIR_CANDIDATES[0], 'attempts.jsonl');
};

// Helper: load last N attempts for a given user
async function loadAttempts(userId, limit = 30) {
  // Prefer in-memory if available
  try {
    const mem = await import('../db/mem.js');
    const rows = Array.isArray(mem?.attempts?.rows) ? mem.attempts.rows : [];
    const byUser = userId ? rows.filter(r => r.userId === userId) : rows;
    if (byUser.length) {
      return byUser.slice(-limit);
    }
  } catch {
    // ignore and fall back to jsonl
  }

  // Fall back to jsonl
  const attemptsPath = getAttemptsPath();
  if (!fs.existsSync(attemptsPath)) return [];
  const lines = fs.readFileSync(attemptsPath, 'utf8')
    .split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const rows = lines.map(l => { try { return JSON.parse(l); } catch { return null; } })
    .filter(Boolean);
  const byUser = userId ? rows.filter(r => r.userId === userId) : rows;
  return byUser.slice(-limit);
}

// Helper: crude feature extraction
function extractFeatures(attempts) {
  const n = attempts.length || 0;
  let avgScore = 0;
  const modeCounts = {};
  const words = [];
  const rubricHits = new Map();

  for (const a of attempts) {
    const s = Number(a?.score ?? 0);
    avgScore += s;
    const m = String(a?.mode ?? 'unknown');
    modeCounts[m] = (modeCounts[m] || 0) + 1;
    const wc = Number(a?.details?.wordCount ?? 0);
    if (wc) words.push(wc);

    // Track rubric keys the grader returned
    const r = Array.isArray(a?.rubric) ? a.rubric : [];
    for (const rk of r) {
      const key = typeof rk === 'string' ? rk : rk?.key;
      if (!key) continue;
      rubricHits.set(key, (rubricHits.get(key) || 0) + 1);
    }
  }
  avgScore = n ? avgScore / n : 0;
  const avgWords = words.length ? Math.round(words.reduce((x,y)=>x+y,0) / words.length) : null;

  // crude “neighbors” (influence) by surface rules
  const influences = [];
  if (avgScore >= 0.7) influences.push('Hemingway-ish precision');
  if ((rubricHits.get('Voice') || 0) > 3) influences.push('Didion-like clarity of stance');
  if ((rubricHits.get('Clarity') || 0) > 3) influences.push('Baldwin-ish control');
  if ((rubricHits.get('Accuracy') || 0) > 3) influences.push('Chandler lean cuts');
  if (!influences.length) influences.push('Finding your lane—keep at it');

  // badges heuristic
  const badges = [];
  if (avgScore >= 0.8) badges.push('Clean Hands (Consistent High Score)');
  if ((modeCounts['why'] || 0) >= 5) badges.push('Philosopher (Rationale Runs)');
  if ((modeCounts['name'] || 0) >= 5) badges.push('Beat Spotter');
  if ((modeCounts['highlight'] || 0) >= 3) badges.push('Highlighter');
  if (!badges.length && n >= 1) badges.push('Back In The Lab');

  return { n, avgScore, avgWords, modeCounts, rubricHits: [...rubricHits.entries()], influences, badges };
}

export async function buildMemo(userId = 'dev') {
  const attempts = await loadAttempts(userId, 40);
  const f = extractFeatures(attempts);

  const pct = Math.round(f.avgScore * 100);
  const seenModes = Object.entries(f.modeCounts)
    .map(([k,v]) => `${k}:${v}`).join(', ') || 'none';
  const strengths = f.rubricHits
    .sort((a,b)=>b[1]-a[1]).slice(0,3).map(([k,v])=>`${k}`).join(', ') || '—';

  const title = `Professor Ray Ray on your pages (last ${f.n} tries)`;
  const body = [
    `Overall: ${pct}% signal. Modes played: ${seenModes}.`,
    f.avgWords ? `Typical length: ~${f.avgWords} words.` : null,
    `Most reliable strengths: ${strengths}.`,
    `Influences spotted: ${f.influences.join('; ')}.`,
    `Next pushes: tighten setup→payoff, keep verbs doing work, and make beats *visible* on the page.`
  ].filter(Boolean).join('\n');

  return { title, body, badges: f.badges };
}

export default buildMemo;
