// server/index.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createReadStream, existsSync } from 'node:fs';
import * as readline from 'node:readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());

if (process.env.NODE_ENV === 'production') {
  app.use(helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "default-src": ["'self'"],
        "script-src": ["'self'"],
        "style-src": ["'self'", "'unsafe-inline'"],
        "img-src": ["'self'", 'data:'],
        "connect-src": ["'self'"],
      },
    },
  }));
} else {
  app.use(helmet({
    contentSecurityPolicy: false,
  }));
}

const FILE = path.resolve(process.cwd(), 'labeled data', 'tweetrunk_renumbered.jsonl'); // <-- exact path with space

function splitIntroPrompt(text) {
  const t = String(text || '');
  const m = t.search(/(?:^|\n)\s*Before we start:/i);
  if (m >= 0) return { intro: t.slice(0, m).trim(), prompt: t.slice(m).trim() };
  const parts = t.split(/\n\s*\n/);
  if (parts.length >= 2) return { intro: parts.slice(0, -1).join('\n\n').trim(), prompt: parts.at(-1).trim() };
  return { intro: t.trim(), prompt: '' };
}

async function* readJSONL(path) {
  if (!existsSync(path)) { console.warn('[Sigil] JSONL not found:', path); return; }
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
        return res.status(200).json({ id, title, intro, prompt });
      }
      i++;
    }
    res.status(404).json({ error: 'lesson_not_found', id: want });
  } catch (e) {
    console.error('[Sigil] /sigil/lesson error', e);
    res.status(200).json({ error: 'read_error' });
  }
});

if (process.env.NODE_ENV === 'production') {
  const dist = path.resolve(__dirname, '../dist');
  app.use(express.static(dist));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/sigil/catalog') || req.path.startsWith('/sigil/lesson/')) {
      return next();
    }

    if (req.method !== 'GET') {
      return next();
    }

    if (req.path === '/sigil' || req.path.startsWith('/sigil/')) {
      return res.sendFile(path.join(dist, 'index.html'));
    }

    if (req.accepts('html') && !req.path.includes('.')) {
      return res.sendFile(path.join(dist, 'index.html'));
    }

    return next();
  });
}

const PORT = process.env.PORT || 3001;
const HOST = '0.0.0.0';               // <— IMPORTANT in Codespaces
app.listen(PORT, HOST, () => {
  console.log(`[API] listening on http://${HOST}:${PORT}`);
});
