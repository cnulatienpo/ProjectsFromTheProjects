// server/index.js
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { fileURLToPath } from 'url'
import path from 'path'

import {
  listSigilIds,
  getSigilItem,
  firstSigilId,
  getSigilDebug,
} from './sigil-syntax/content.js'

const app = express()

// Basic middleware
app.use(express.json({ limit: '1mb' }))
app.use(cookieParser())

// CORS: allow your dev frontend origin explicitly
const FRONTEND_ORIGIN = 'https://animated-carnival-v4g77qwxgvv3p5p5-5173.app.github.dev'
app.use(cors({
  origin: [FRONTEND_ORIGIN],
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
}))

app.get('/', (req, res) => {
  res.json({ ok: true, msg: 'API server. Try /health or /sigil/catalog' })
})

// Health & status
app.get('/health', (req, res) => res.json({ ok: true, ts: new Date().toISOString() }))
app.get('/status', (req, res) => res.json({ ok: true, env: process.env.NODE_ENV || 'development' }))

// ---- Sigil_&_Syntax (catalog + single lesson)
app.get('/_debug/sigil', (req, res) => res.json(getSigilDebug()))

app.get('/sigil/catalog', (req, res) => {
  try {
    const games = listSigilIds()
    return res.json({ games, first: firstSigilId() })
  } catch (e) {
    return res.status(500).json({ error: 'sigil_catalog_failed', message: String(e) })
  }
})

app.get('/sigil/game/:id', (req, res) => {
  try {
    const it = getSigilItem(req.params.id)
    if (!it) return res.status(404).json({ error: 'not_found', id: req.params.id })
    return res.json(it)
  } catch (e) {
    return res.status(500).json({ error: 'sigil_item_failed', message: String(e), id: req.params.id })
  }
})

// ---- 404 (must be last non-error middleware)
app.use((req, res) => {
  res.status(404).json({ error: 'not_found', path: req.path })
})

// ---- Error handler (must have 4 args)
app.use((err, req, res, next) => {
  console.error('[server error]', err)
  if (res.headersSent) return next(err)
  res.status(500).json({ error: 'server_error', message: String(err?.message || err) })
})

// ---- Start server ONLY when run as entrypoint; never call app() directly
const isEntrypoint = fileURLToPath(import.meta.url) === process.argv[1]
const PORT = Number(process.env.PORT || 3001)
const HOST = process.env.HOST || '0.0.0.0'

if (isEntrypoint) {
  app.listen(PORT, HOST, () => {
    console.log(`Server listening on http://${HOST}:${PORT}`)
  })
}

export default app
