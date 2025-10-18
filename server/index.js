// server/index.js
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

// Sigil content loader (reads the cached bundle)
import {
  getSigilItem,
  getSigilDebug,
} from './sigil-syntax/content.js'

const app = express()

app.use((req, res, next) => {
  // allow all for testing; tighten later if needed
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
  if (req.method === 'OPTIONS') return res.sendStatus(204)
  next()
})
app.use(cors({ origin: true, credentials: false }))

app.use(express.json({ limit: '1mb' }))
app.use(cookieParser())

// ---- DEV LOGGING (first middleware) ----
app.use((req, res, next) => {
  console.log('[API]', req.method, req.url);
  next();
});

// ---- HEALTH ----
app.get('/health', (req, res) => res.status(200).json({ ok: true }));

// ---- CATALOG: NEVER 500 IN DEV ----
app.get('/sigil/catalog', (req, res) => {
  try {
    const payload = {
      items: [
        { id: 'clause-001', title: 'Independent vs Dependent Clause', level: 1, type: 'lesson' },
        { id: 'punct-001', title: 'Comma Splices: Cut or Join?', level: 1, type: 'drill' },
        { id: 'device-001', title: 'Metaphor vs Simile', level: 1, type: 'drill' }
      ]
    };
    console.log('[API] returning catalog payload of', payload.items.length, 'items');
    res.status(200).json(payload);
  } catch (e) {
    console.error('[API] catalog error', e);
    res.status(200).json({ items: [] }); // never 500 in dev
  }
})

// --- Sigil_&_Syntax API
app.get('/_debug/sigil', (_req, res) => res.json(getSigilDebug()))

app.get('/sigil/game/:id', (req, res) => {
  const it = getSigilItem(req.params.id)
  if (!it) return res.status(404).json({ error: 'not_found', id: req.params.id })
  res.json(it)
})

// --- 404 and error handlers
app.use((req, res) => res.status(404).json({ error: 'not_found', path: req.path }))
app.use((err, _req, res, next) => {
  if (res.headersSent) return next(err)
  res.status(500).json({ error: 'server_error', message: String(err?.message || err) })
})

// --- start only if this file is the entrypoint
import { fileURLToPath } from 'url'
const isEntrypoint = fileURLToPath(import.meta.url) === process.argv[1]
const PORT = Number(process.env.PORT || 3001)
const HOST = process.env.HOST || '0.0.0.0'

if (isEntrypoint) {
  app.listen(PORT, HOST, () => {
    console.log(`Server listening on http://${HOST}:${PORT}`)
  })
}

export default app
