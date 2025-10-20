// server/index.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createReadStream, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import * as readline from 'node:readline';
import { buildReport } from './report/index.js';
import { mark, getUserState } from './progress/store.js';
import { listSigilIds } from './sigil/catalogIds.js';

const app = express();
app.use(cors());

// === Helmet: strict CSP in PROD; disable CSP in DEV so Vite dev client works ===
if (process.env.NODE_ENV === 'production') {
  app.use(helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "default-src": ["'self'"],
        "script-src": ["'self'"],          // no eval, no inline in prod
        "style-src": ["'self'", "'unsafe-inline'"],
        "img-src": ["'self'", "data:"],
        "connect-src": ["'self'"],         // add external APIs if needed
        "font-src": ["'self'", "data:"],
      }
    }
  }));
} else {
  app.use(helmet({ contentSecurityPolicy: false })); // DEV: turn off CSP on API origin
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
    const items = [];
    let i = 0;
    for await (const row of readJSONL(FILE)) {
      const id = String(row?.new_id ?? row?.original_id ?? `item-${i}`);
      const title = String((row?.title ?? ((row?.text ?? '').toString().slice(0, 140))) || `Untitled ${id}`);
      items.push({ id, title });
      if (++i >= 500) break;
    }
    res.status(200).json({ items });
  } catch (e) {
    console.error('[Sigil] /sigil/catalog error', e);
    res.status(200).json({ items: [] });
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
    console.error('[Sigil] /sigil/lesson error', e);
    res.status(200).json({ error: 'read_error' });
  }
});

// Save progress events (started/submitted)
app.post('/progress/mark', express.json(), async (req, res) => {
  const { userId, lessonId, kind, verdict } = req.body || {};
  if (!userId || !lessonId || !kind) return res.status(400).json({ error: 'bad_request' });
  const state = await mark(userId, lessonId, String(kind), verdict);
  res.json({ ok: true, state });
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
