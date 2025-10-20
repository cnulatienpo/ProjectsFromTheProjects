// server/index.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createReadStream, existsSync, appendFileSync } from 'node:fs';
import { resolve } from 'node:path';
import * as readline from 'node:readline';
import { buildReport } from './report/index.js';
import { mark, getUserState } from './progress/store.js';
import { listSigilIds } from './sigil/catalogIds.js';

const app = express();
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
  if (!existsSync(path)) return;
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

// Start server
const PORT = process.env.PORT || 3001;
const HOST = '0.0.0.0';
app.listen(PORT, HOST, () => console.log(`[API] listening on http://${HOST}:${PORT}`));
