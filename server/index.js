// server/index.js
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as readline from 'node:readline';
import { buildReport } from './report/index.js';
import { mark, getUserState } from './progress/store.js';
import { listSigilIds } from './sigil/catalogIds.js';

// Import new API routes
import nextRoutes from './routes/next.js';
import skipRoutes from './routes/skip.js';
import versionRoutes from './routes/version.js';
import healthRoutes from './routes/health.js';
import debugContentRoutes from './routes/debugContent.js';

const { createReadStream, appendFileSync } = fs;
const { resolve } = path;

const __filename = fileURLToPath(import.meta.url);
const app = express();

// ---- static bundle paths (single source of truth)
const distDir = path.resolve(process.cwd(), 'app', 'dist');
const distIndex = path.join(distDir, 'index.html');
const hasDist = fs.existsSync(distIndex);
// -----------------------------------------------

const mounted = [];

const logMountedRoutes = () => {
  if (!mounted.length) return;
  const preferredOrder = [
    '/api/attempt',
    '/api/healthz',
    '/api/version',
    '/api/debug/content',
    '/api/skip',
    '/api/reports/latest',
    '/api/reports/ping',
  ];
  const seen = new Set();
  const ordered = [];

  for (const route of preferredOrder) {
    if (mounted.includes(route) && !seen.has(route)) {
      ordered.push(route);
      seen.add(route);
    }
  }

  for (const route of mounted) {
    if (!seen.has(route)) {
      ordered.push(route);
      seen.add(route);
    }
  }

  console.log(`>>> Mounted routes: ${ordered.join(', ')}`);
};

console.log(">>> BOOTED SERVER FROM", __filename);

app.set('trust proxy', true);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// === Helmet: relaxed CSP in DEV so Vite dev client works; strict in PROD ===
const isProd = process.env.NODE_ENV === 'production';

if (isProd) {
  app.use(helmet());
  console.log('🔒 Helmet: production CSP enabled');
} else {
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
      crossOriginOpenerPolicy: false,
    })
  );
  console.log('⚙️  Helmet: relaxed CSP for development');
}

// ====== New API routes ======
try {
  app.use(healthRoutes);
  mounted.push('/api/healthz');
  app.use(versionRoutes);
  mounted.push('/api/version');
  app.use(debugContentRoutes);
  mounted.push('/api/debug/content');
} catch (e) {
  console.warn('Route mounting warning:', e && e.message);
}

app.use('/api', nextRoutes);
mounted.push('/api/next');
app.use('/api', skipRoutes);
mounted.push('/api/skip');

const attemptRouteMount = (async () => {
  try {
    const mod = await import('./routes/attempt.js');
    const attemptRouter = mod.default || mod;
    app.use('/api/attempt', attemptRouter);
    mounted.push('/api/attempt');
    logMountedRoutes();
  } catch (err) {
    console.error('Attempt route mount failed:', err?.message || err);
  }
})();

const reportsRouteMount = (async () => {
  try {
    const mod = await import('./routes/reports.js');
    const reportsRouter = mod.default || mod;
    // mount at /api so router paths like /reports/latest map to /api/reports/latest
    app.use('/api', reportsRouter);
    mounted.push('/api/reports/latest');
    mounted.push('/api/reports/ping');
    logMountedRoutes();
  } catch (err) {
    console.error('Reports route mount failed:', err?.message || err);
  }
})();

// ====== Sigil JSONL endpoints (unchanged) ======
const FILE = resolve(process.cwd(), 'labeled data', 'tweetrunk_renumbered.jsonl');

function splitIntroPrompt(text) {
  const t = String(text || '');
  const m = t.search(/(?:^|\n)\s*Before we start:/i);
  if (m >= 0) return { intro: t.slice(0, m).trim(), prompt: t.slice(m).trim() };
  const parts = t.split(/\n\s*\n/);
  if (parts.length >= 2) return { intro: parts.slice(0, -1).join('\n\n').trim(), prompt: parts.at(-1).trim() };
  return { intro: t.trim(), prompt: '' };
}
function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, (ch) => {
    switch (ch) {
      case '&': return '&amp;';
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '"': return '&quot;';
      case "'": return '&#39;';
      default: return ch;
    }
  });
}

function toParagraphHtml(s) {
  if (!s) return '';
  const parts = String(s).split(/\n\s*\n+/).map(p => p.trim()).filter(Boolean);
  return parts.map(p => `<p>${escapeHtml(p).replace(/\n/g, '<br/>')}</p>`).join('\n');
}
async function* readJSONL(path) {
  if (!fs.existsSync(path)) return;
  const rl = readline.createInterface({ input: createReadStream(path), crlfDelay: Infinity });
  for await (const ln of rl) {
    const s = ln.trim();
    if (!s || s.startsWith('//')) continue;
    try { yield JSON.parse(s.replace(/,?$/, '')); } catch { }
  }
}

app.get('/health', (_req, res) => res.json({ ok: true }));

app.get('/sigil/catalog', async (_req, res) => {
  try {
    console.log('[Sigil] Starting catalog read from:', FILE);
    const items = [];
    let i = 0;
    for await (const row of readJSONL(FILE)) {
      const id = String(row?.new_id ?? row?.original_id ?? `item-${i}`);
      const title = String((row?.title ?? ((row?.text ?? '').toString().slice(0, 140))) || `Untitled ${id}`);
      items.push({ id, title });
      if (++i >= 500) break;
    }
    console.log('[Sigil] Catalog loaded', items.length, 'items');
    res.status(200).json({ items });
  } catch (e) {
    console.error('[Sigil] /sigil/catalog error', e);
    res.status(500).json({ error: 'Failed to load catalog', message: e.message });
  }
});

app.get('/sigil/lesson/:id', async (req, res) => {
  const want = String(req.params.id);
  try {
    let i = 0;
    for await (const row of readJSONL(FILE)) {
      const id = String(row?.new_id ?? row?.original_id ?? `item-${i}`);
      if (id === want) {
        const title = String(row?.title ?? (row?.text ?? '').toString().split('\n')[0] ?? `Untitled ${id}`);
        const { intro, prompt } = splitIntroPrompt((row?.text ?? '').toString());
        const content_html = toParagraphHtml(intro || (row?.text ?? ''));
        const prompt_html = toParagraphHtml(prompt || row?.prompt || '');
        const min_words = Number(row?.min_words ?? row?.minWords ?? row?.minimum ?? 30) || 30;
        return res.status(200).json({ id, title, intro, prompt, content_html, prompt_html, min_words });
      }
      i++;
    }
    res.status(404).json({ error: 'lesson_not_found', id: want });
  } catch (e) {
    const msg = `[SIGIL LESSON ERROR] ${new Date().toISOString()} ${String(e.stack || e)}\n`;
    try { appendFileSync('/tmp/server.err.log', msg); } catch (ex) { /* ignore */ }
    console.error(msg);
    res.status(500).json({ error: 'server_error', message: String(e?.message || e) });
  }
});

// Save progress events (started/submitted)
app.post('/progress/mark', async (req, res) => {
  try {
    const body = req.body ?? {};
    const userId = typeof body.userId === 'string' && body.userId.trim() ? body.userId.trim() : null;
    const lessonIdRaw = body.lessonId ?? body.id ?? req.query.lessonId ?? null;
    const lessonId = typeof lessonIdRaw === 'string' && lessonIdRaw.trim() ? lessonIdRaw.trim() : null;
    const kindRaw = body.kind ?? body.event ?? null;
    const kind = typeof kindRaw === 'string' && kindRaw.trim() ? kindRaw.trim() : null;
    const verdict = body.verdict ?? null;

    if (!userId || !lessonId || !kind) {
      console.warn('[progress/mark] missing fields', { userId, lessonId, kind });
      return res.status(200).json({ ok: false, error: 'missing_fields', userId, lessonId, kind });
    }

    const state = await mark(userId, lessonId, kind, verdict);
    return res.json({ ok: true, state });
  } catch (e) {
    const msg = `[PROGRESS MARK ERROR] ${new Date().toISOString()} ${String(e.stack || e)}\n`;
    try { appendFileSync('/tmp/server.err.log', msg); } catch (ex) { /* ignore */ }
    console.error('[/progress/mark] error', e);
    return res.status(200).json({ ok: false, error: 'server_error', message: String(e?.message || e) });
  }
});

// Minimal state (for debugging or future use)
app.get('/progress/state', async (req, res) => {
  const userId = String(req.query.userId || '');
  if (!userId) return res.status(400).json({ error: 'bad_request' });
  const state = await getUserState(userId);
  res.json({ ok: true, state });
});

// What lesson should "Continue" open?
app.get('/progress/next', async (req, res) => {
  const userId = String(req.query.userId || '');
  if (!userId) return res.status(400).json({ error: 'bad_request' });
  const ids = listSigilIds();
  const state = await getUserState(userId);
  if (!ids.length) return res.json({ ok: true, nextId: null });
  // first unfinished, else fall back to lastId, else first
  const set = new Set(state.submitted || []);
  const firstUnfinished = ids.find(id => !set.has(id)) || null;
  const nextId = firstUnfinished || state.lastId || ids[0];
  res.json({ ok: true, nextId });
});

// POST attempt analysis
app.post('/attempt', express.json(), async (req, res) => {
  const { id, text, minWords } = req.body || {};
  if (typeof text !== 'string') return res.status(400).json({ error: 'bad_request', message: 'text required' });
  try {
    const report = await buildReport(text, { minWords: Number(minWords || 30) });
    res.json({ id: id || null, report });
  } catch (e) {
    res.status(500).json({ error: 'server_error', message: String(e?.message || e) });
  }
});

await attemptRouteMount;
await reportsRouteMount;

// 🔒 Make sure unknown /api/* doesn't fall through to static site
app.use('/api', (req, res, next) => {
  if (!res.headersSent) {
    return res.status(404).json({ error: 'Not Found', path: req.originalUrl });
  }
  next();
});

// ====== Static UI (serves the built app/dist) ======
if (hasDist) {
  app.use(express.static(distDir, {
    fallthrough: true,
    index: 'index.html',
    setHeaders(res) {
      // Make it easy to test locally
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
  }));
  console.log(`>>> Serving static bundle from ${distDir}`);
} else {
  console.warn(`>>> Static bundle missing at ${distDir} — run \`npm --prefix app run build\` to generate it.`);
}

// Fallback to index.html for client routes
app.get('*', (req, res, next) => {
  if (!hasDist) return next();
  try {
    createReadStream(distIndex).pipe(res);
  } catch (e) {
    next(e);
  }
});

// Start server
// Default to 3002 to match frontend proxy configuration and avoid conflicts
const HOST = '0.0.0.0';
const basePort = Number(process.env.PORT || 3002);

// --- listen with auto-retry if the port is busy ---
function listenWithRetry(port, attemptsLeft = 5) {
  const server = app.listen(port, HOST, () => {
    console.log(`>>> Server listening on http://localhost:${port}`);
  });
  server.on("error", (err) => {
    if (process.env.FORCE_PORT === "1") throw err;
    if (err && err.code === "EADDRINUSE" && attemptsLeft > 0) {
      console.warn(`Port ${port} in use, retrying on ${port + 1} ...`);
      listenWithRetry(port + 1, attemptsLeft - 1);
    } else {
      throw err;
    }
  });
}

listenWithRetry(basePort);
