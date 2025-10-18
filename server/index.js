// server/index.js
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { fileURLToPath } from 'url'

// Sigil content loader (reads the cached bundle)
import {
  getSigilItem,
  getSigilDebug,
} from './sigil-syntax/content.js'
import { installSigilCatalogRoute } from './sigilCatalog'

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

// --- DEV LOGGING ---
app.use((req, res, next) => {
  console.log('[API]', req.method, req.url)
  next()
})

// --- HEALTH ---
app.get('/health', (req, res) => res.status(200).json({ ok: true, pid: process.pid }))

installSigilCatalogRoute(app)

// --- DEBUG: show request headers & env
app.get('/_debug/api', (req, res) => {
  res.json({
    headers: req.headers,
    env: {
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT,
    },
    routes: ['/health', '/sigil/catalog', '/_debug/api'],
  })
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
const isEntrypoint = fileURLToPath(import.meta.url) === process.argv[1]
let server

if (isEntrypoint && !server?.listening && typeof app.listen === 'function') {
  const PORT = process.env.PORT || 3001
  server = app.listen(PORT, () => console.log(`[API] listening on http://localhost:${PORT}`))
}

export default app
