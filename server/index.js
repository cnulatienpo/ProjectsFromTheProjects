import express from 'express'
import cors from 'cors'
import fs from 'fs'
import path from 'path'
import { ENV } from './config/env.js'
import { listSkills, unitsForSkill, nextUnitForSkill } from './contentMap.js'
import { readBundle, listItemIds, getItem, listLessons, getLesson } from './bundle.js'
import { readStatus } from './status.js'
import { levelForXp, checkBadges } from './sigil-syntax/progression.js'
import { readReportPhrases } from './sigil-syntax/reportPhrases.js'
import { loadEvolver } from './sigil-syntax/reportEvolve.loader.js'
import { evaluateAttempt } from './sigil-syntax/judgment.js'
import { listWriterTypes, getWriterType, allWriterTypes } from './sigil-syntax/writerTypes.js'
import { listReportTypes, getReportType, defaultReportType } from './sigil-syntax/reportTypes.js'
import { analyzeText } from './sigil-syntax/styleReport.js'
import { listCutIds, getCutItem } from './cutGood/index.js'
import { listGoodIds, getGoodItem } from './goodword/index.js'
import { listSigilIds, getSigilItem, firstSigilId, getSigilDebug } from './sigil-syntax/content.js'
import basicAuth from 'basic-auth'
import { debugResolvedPaths } from './lib/resolvePaths.js'
import { collectDiagnostics } from './diag.js'

let morgan = null
try {
    const mod = await import('morgan')
    morgan = mod.default || mod
} catch {
    morgan = null
}

const app = express()

// --- CORS logic: allow GitHub Pages, ENV origins, and localhost in dev ---
const ORIGIN_PAGES = process.env.ORIGIN_PAGES || ENV.ORIGIN_PAGES || 'https://<your-user>.github.io'
const allowedOrigins = new Set(
    [
        ORIGIN_PAGES,
        ...(ENV.ORIGIN_EXTRA || []),
        ...(ENV.ALLOW_LOCALHOST ? [
            'http://localhost:5173',
            'http://127.0.0.1:5173',
            'http://localhost:5174',
            'http://127.0.0.1:5174'
        ] : [])
    ].filter(Boolean)
)

function corsOrigin(origin, cb) {
    if (!origin) return cb(null, true)
    try {
        const url = new URL(origin)
        if (allowedOrigins.has(origin)) return cb(null, true)
        if (/\.github\.io$/i.test(url.hostname)) return cb(null, true)
        return cb(new Error(`CORS blocked for origin: ${origin}`))
    } catch {
        return cb(new Error(`Invalid origin: ${origin}`))
    }
}

app.use(cors({
    origin: corsOrigin,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false
}))
app.options('*', cors())

if (morgan) {
    app.use(morgan(':method :url :status :res[content-length] - :response-time ms'))
} else {
    app.use((req, res, next) => {
        const started = Date.now()
        res.on('finish', () => {
            const duration = Date.now() - started
            console.log(req.method, req.url, res.statusCode, `${duration}ms`)
        })
        next()
    })
}

app.use(express.json({ limit: '1mb' }))

const state = new Map()

app.get('/health', (req, res) => {
    res.json({ ok: true, ts: new Date().toISOString() })
})

app.get('/status', (req, res) => {
    res.json({
        ok: true,
        env: ENV.NODE_ENV,
        version: ENV.VERSION || null,
        build: ENV.BUILD_STAMP || null,
        time: new Date().toISOString(),
        status: readStatus()
    })
})

app.get('/ping', (req, res) => res.type('text/plain').send('pong'))

app.post('/echo', (req, res) => {
    res.json({ ok: true, headers: req.headers, body: req.body || null })
})

app.get('/_debug/cors', (req, res) => {
    const origin = req.headers.origin || null
    let allowed = false
    if (!origin) {
        allowed = true
    } else {
        try {
            const url = new URL(origin)
            allowed = allowedOrigins.has(origin) || /\.github\.io$/i.test(url.hostname)
        } catch {
            allowed = false
        }
    }

    res.json({
        ok: true,
        origin,
        allowed,
        allowedOrigins: Array.from(allowedOrigins)
    })
})

app.get('/__diag', (req, res) => {
    try {
        res.json({ ok: true, ...collectDiagnostics() })
    } catch (e) {
        res.status(500).json({ ok: false, error: String(e) })
    }
})

app.get('/whoami', (req, res) => {
    res.json({
        ip: req.ip,
        ips: req.ips || [],
        ua: req.headers['user-agent'] || '',
        origin: req.headers.origin || null,
        referer: req.headers.referer || null
    })
})

// List available skills
app.get('/content/skills', (req, res) => {
    res.json({ skills: listSkills() })
})

// List units for a specific skill
app.get('/content/units/:skill', (req, res) => {
    const { skill } = req.params
    res.json({ skill, units: unitsForSkill(skill) })
})

// Get the “next” unit for a skill (history is optional)
app.post('/content/next', (req, res) => {
    const { skill, history } = req.body || {}
    if (!skill) return res.status(400).json({ error: 'missing_skill' })
    const unit = nextUnitForSkill(skill, Array.isArray(history) ? history : [])
    res.json({ skill, unit })
})

// Catalog endpoints (now from bundle)
app.get('/catalog/games', (req, res) => {
    res.json({ games: listItemIds() })
})

app.get('/catalog/game/:id', (req, res) => {
    const item = getItem(req.params.id)
    if (!item) return res.status(404).json({ error: 'not_found', id: req.params.id })
    res.json(item)
})

// Cut Game
app.get('/cut/catalog', (req, res) => res.json({ games: listCutIds() }))
app.get('/cut/game/:id', (req, res) => {
    const it = getCutItem(req.params.id)
    if (!it) return res.status(404).json({ error: 'not_found', id: req.params.id })
    res.json(it)
})

// The Good Word
app.get('/goodword/catalog', (req, res) => res.json({ games: listGoodIds() }))
app.get('/goodword/game/:id', (req, res) => {
    const it = getGoodItem(req.params.id)
    if (!it) return res.status(404).json({ error: 'not_found', id: req.params.id })
    res.json(it)
})

// Debug: see which file/path the server is using
app.get('/_debug/sigil', (req, res) => res.json(getSigilDebug()))

// Catalog with error disclosure instead of silent 500
app.get('/sigil/catalog', (req, res) => {
    try {
        const ids = listSigilIds()
        return res.json({ games: ids, first: firstSigilId() })
    } catch (e) {
        return res.status(500).json({ error: 'sigil_catalog_failed', message: String(e) })
    }
})

// Lessons endpoints
app.get('/lessons', (req, res) => {
    res.json({ lessons: listLessons() })
})

app.get('/lessons/:lesson_id', (req, res) => {
    const lesson = getLesson(req.params.lesson_id)
    if (!lesson) return res.status(404).json({ error: 'not_found', lesson_id: req.params.lesson_id })
    res.json(lesson)
})

// Bundle info endpoint
app.get('/bundle/info', (req, res) => {
    const bundle = readBundle()
    res.json({
        version: bundle.version,
        generated_at: bundle.generated_at,
        counts: { items: bundle.items.length, lessons: bundle.lessons.length }
    })
})

// --- For /api/next, /api/submit, /api/progress, use bundle lessons/items ---
// foundations disabled (Sigil_&_Syntax uses bundle from tweetrunk)
const lessons = []
const items = []

// mastery rollup per skill (for the Progress panel)
app.get('/api/mastery', (req, res) => {
    const user_id = String(req.query.user_id || 'local-user')
    const U = getUser(user_id) // from the in-memory state we added earlier
    // shape: [{ skill, mu, last_score }]
    const rows = Object.entries(U.mastery || {}).map(([skill, mu]) => {
        // best-effort: find the last score from any lesson that teaches this skill
        let last_score = 0
        for (const f of lessons) {
            if (f.skills?.includes(skill)) {
                const p = U.progress[f.lesson_id]
                if (p?.last_score != null) { last_score = p.last_score; break }
            }
        }
        return { skill, mu, last_score }
    })
    res.json({ rows })
})

// Get server status
app.get('/status/raw', (req, res) => res.json(readStatus()))

function getUser(u = 'local-user') {
    if (!state.has(u)) state.set(u, {
        mastery: {},
        progress: {},
        xp: 0,
        level: 1,
        badges: new Set(),
        attemptsTotal: 0,
        streakDays: 0,
        session: {}
    })
    return state.get(u)
}

app.post('/api/submit', (req, res) => {
    // ...existing scoring logic...
    const { user_id = 'local-user', item_id, response, score } = req.body || {}
    const U = getUser(user_id)

    // basic attempt counters
    U.attemptsTotal = (U.attemptsTotal || 0) + 1
    // simple first-try high heuristic for MCQ (override as you like)
    const firstTryHigh = (response?.key !== undefined && score === 1)
    U.session.lastRun = { firstTryHigh, usedHints: response?.usedHints ?? false }

    // award XP (tune the multiplier later)
    const gained = Math.round(score * 25)
    U.xp = (U.xp || 0) + gained

    const prevLevel = U.level || 1
    const now = levelForXp(U.xp)
    U.level = now.id

    // badge checks
    const newOnes = checkBadges(U)
    for (const b of newOnes) {
        U.badges.add(b.id)
        U.xp += (b.xp_bonus || 0)
    }
    const leveledUp = U.level > prevLevel

    return res.json({
        ok: true,
        score,
        xp: U.xp,
        level: U.level,
        levelUp: leveledUp ? { from: prevLevel, to: U.level } : null,
        newBadges: newOnes.map(b => ({ id: b.id, title: b.title, desc: b.desc, xp_bonus: b.xp_bonus }))
    })
})

app.get('/api/profile', (req, res) => {
    const user_id = String(req.query.user_id || 'local-user')
    const U = getUser(user_id)
    res.json({ xp: U.xp || 0, level: U.level || 1, badges: Array.from(U.badges || []) })
})

// Logging endpoint
const LOG_DIR = path.resolve('game thingss', 'logs')
function ensureLogDir() { try { fs.mkdirSync(LOG_DIR, { recursive: true }) } catch { } }
function logPathFor(date = new Date()) {
    const d = date.toISOString().slice(0, 10) // YYYY-MM-DD
    return path.join(LOG_DIR, `frontend-${d}.ndjson`)
}

app.post('/log', express.json({ limit: '32kb' }), (req, res) => {
    try {
        ensureLogDir()
        const line = req.body && typeof req.body === 'object' ? req.body : { msg: String(req.body) }
        // sanitize: drop obvious PII-ish fields if present
        delete line.email; delete line.phone; delete line.token
        // attach server timestamp & ip (best-effort)
        const rec = {
            ts_server: new Date().toISOString(),
            ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress || '',
            ...line
        }
        fs.appendFileSync(logPathFor(), JSON.stringify(rec) + '\n', 'utf8')
        res.json({ ok: true })
    } catch (e) {
        console.error('log_write_error', e)
        res.status(500).json({ ok: false })
    }
})

    // Optional: weekly cleanup
    (function rotateLogs(days = 14) {
        ensureLogDir()
        const cutoff = Date.now() - days * 24 * 60 * 60 * 1000
        for (const f of fs.readdirSync(LOG_DIR)) {
            const p = path.join(LOG_DIR, f)
            try {
                const st = fs.statSync(p)
                if (st.isFile() && st.mtimeMs < cutoff) fs.unlinkSync(p)
            } catch { }
        }
    })()

app.post('/api/judge', express.json({ limit: '200kb' }), (req, res) => {
    try {
        const { id, response, score } = req.body || {}
        const r = evaluateAttempt({ id, response, baseScore: score, userState: getUser('local-user') })
        return res.json(r)
    } catch (e) {
        const code = e.code === 'unknown_game' ? 404 : 500
        return res.status(code).json({ error: e.code || 'judge_failed', message: String(e.message || e) })
    }
})

app.post('/style-report', express.json({ limit: '200kb' }), async (req, res) => {
    const { text, history } = req.body || {}
    if (typeof text !== 'string' || !text.trim()) {
        return res.status(400).json({ error: 'missing_text' })
    }

    const base = analyzeText(text)
    const latest = {
        score: base.score,
        feedback: Array.isArray(base.notes) ? base.notes : [],
        tags: (Array.isArray(base.notes) ? base.notes : []).map((_, idx) => `style-${idx}`),
    }

    let evolved = { ...latest }
    try {
        const evolver = await loadEvolver()
        if (typeof evolver === 'function') {
            const out = await evolver(Array.isArray(history) ? history : [], latest)
            if (out && typeof out === 'object') {
                evolved = {
                    score: typeof out.score === 'number' ? out.score : latest.score,
                    feedback: Array.isArray(out.feedback) ? out.feedback : latest.feedback,
                    tags: Array.isArray(out.tags) ? out.tags : latest.tags,
                }
            }
        }
    } catch (e) {
        console.warn('[style-report] evolver error', e?.message || e)
    }

    const phrases = readReportPhrases()
    const feedback = evolved.feedback && evolved.feedback.length ? [...evolved.feedback] : [...(phrases.generic || [])]
    const closers = base.score < 0.4 ? phrases.closers.low : base.score < 0.8 ? phrases.closers.mid : phrases.closers.high
    if (Array.isArray(closers) && closers.length) {
        const closer = closers[Math.floor(Math.random() * closers.length)]
        if (closer) feedback.push(closer)
    }

    return res.json({
        schema: 'sigil-syntax/style/v1',
        ...base,
        feedback,
        tags: evolved.tags,
    })
})

// Writer types endpoints
app.get('/writer-types', (req, res) => res.json({ types: listWriterTypes() }))
app.get('/writer-types/all', (req, res) => res.json({ items: allWriterTypes() }))
app.get('/writer-types/:id', (req, res) => {
    const it = getWriterType(req.params.id)
    if (!it) return res.status(404).json({ error: 'not_found', id: req.params.id })
    res.json(it)
})

// Report types endpoints
app.get('/report-types', (req, res) => res.json({ types: listReportTypes() }))
app.get('/report-types/default', (req, res) => {
    const t = defaultReportType()
    if (!t) return res.status(404).json({ error: 'no_types' })
    res.json(t)
})
app.get('/report-types/:id', (req, res) => {
    const t = getReportType(req.params.id)
    if (!t) return res.status(404).json({ error: 'not_found', id: req.params.id })
    res.json(t)
})

app.get('/_debug/paths', (req, res) => res.json({ paths: debugResolvedPaths() }))

const PUBLIC_PATHS = [
    /^\/health$/, /^\/status$/, /^\/_debug\/sigil$/,
    /^\/sigil(\/|$)/, /^\/goodword(\/|$)/,
    /^\/report-types(\/|$)/, /^\/writer-types(\/|$)/
]
const isPublic = (p) => PUBLIC_PATHS.some(rx => rx.test(p))

app.use((req, res, next) => {
    if (isPublic(req.path) || !ENV.REQUIRE_AUTH) return next()
    const creds = basicAuth && basicAuth(req)
    if (!creds || creds.name !== ENV.AUTH_USER || creds.pass !== ENV.AUTH_PASS) {
        res.set('WWW-Authenticate', 'Basic realm="pfp"')
        return res.status(401).json({ error: 'auth_required' })
    }
    next()
})

const server = process.env.NODE_ENV === 'test'
    ? null
    : app.listen(ENV.PORT, ENV.HOST, () => {
        console.log(`Server listening on http://${ENV.HOST}:${ENV.PORT}  (env=${ENV.NODE_ENV})`)
    })

export { app, server }
export default app
