// server/index.js
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

// Sigil content loader (reads the cached bundle)
import {
  listSigilIds,
  getSigilItem,
  firstSigilId,
  getSigilDebug,
} from './sigil-syntax/content.js'

const app = express()
app.use(express.json({ limit: '1mb' }))
app.use(cookieParser())

// CORS so the frontend (dev + prod) can talk to us
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true)
      try {
        const { host } = new URL(origin)
        if (host.endsWith('.app.github.dev')) return cb(null, true)
      } catch {}
      if (origin.startsWith('http://localhost:')) return cb(null, true)
      return cb(null, false)
    },
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    maxAge: 86400,
    credentials: false
  })
)

// Make sure preflight never 404s
app.options('*', cors())

// --- health & ping
app.get('/health', (_req, res) => res.json({ ok: true, ts: new Date().toISOString() }))
app.get('/__ping', (req, res) => {
  res.json({ ok: true, path: req.path, origin: req.headers.origin || null })
})

// --- Sigil_&_Syntax API
app.get('/_debug/sigil', (_req, res) => res.json(getSigilDebug()))

app.get('/sigil/catalog', (_req, res) => {
  const games = listSigilIds()
  res.json({ ok: true, items: games, first: firstSigilId() })
})

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
