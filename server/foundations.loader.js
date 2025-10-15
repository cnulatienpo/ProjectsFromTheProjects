import fs from 'fs'
import path from 'path'

// Put your source files under "game thingss/"
const FOUNDATIONS_JSONL = path.resolve('game thingss', 'foundations.jsonl')
const SKILL_MAP_JSON = path.resolve('game thingss', 'foundation_skill_map.json')
const CATALOG_JSON = path.resolve('server/data', 'games_catalog.json')

function readLines(file) {
    try {
        const txt = fs.readFileSync(file, 'utf8').trim()
        if (!txt) return []
        return txt.split('\n').map(l => JSON.parse(l))
    } catch { return [] }
}

export function loadFoundations() {
    const lessons = readLines(FOUNDATIONS_JSONL)
    const skillMap = JSON.parse(fs.readFileSync(SKILL_MAP_JSON, 'utf8'))
    const catalog = fs.existsSync(CATALOG_JSON) ? JSON.parse(fs.readFileSync(CATALOG_JSON, 'utf8')) : { games: {} }

    // normalize lessons with skills from tag map
    const rows = lessons.map(r => {
        const tags = Array.isArray(r.tags) ? r.tags : []
        const skills = Array.from(new Set(tags.flatMap(t => skillMap[t] || [])))
        return {
            lesson_id: r.lesson_id,
            ord: Number(r.order || r.ord || 0),
            title: r.title || '',
            body: r.body || '',
            skills
        }
    }).sort((a, b) => a.ord - b.ord)

    // practice pool from your catalog (match items that train any skill)
    const items = Object.values(catalog.games || {}).map(g => ({
        id: g.id, mode: g.input_type, prompt_html: g.prompt_html, choices: g.choices,
        correct_index: g.correct_index, skills: [g.skill].filter(Boolean), answer: g.answer || {}
    }))

    return { lessons: rows, items }
}

// Add to your server/index.js (or import from a new file)
import { loadFoundations } from './foundations.loader.js'
const { lessons, items } = loadFoundations()

// in-memory user state (swap to a json file later if you want persistence)
const state = new Map() // user_id -> { mastery: {skill: mu}, progress: { [lesson_id]: {attempts:number, last_score:number}} }

const TARGET = Number(process.env.FOUNDATION_TARGET || 0.8)
const MIN_PRACTICE = Number(process.env.FOUNDATION_MIN_PRACTICE || 2)

function getUser(u = 'local-user') {
    if (!state.has(u)) state.set(u, { mastery: {}, progress: {} })
    return state.get(u)
}
function avgMastery(mu, skills) { if (!skills?.length) return 0; const v = skills.map(s => mu[s] || 0); return v.reduce((a, b) => a + b, 0) / v.length }
function updateMastery(mu = 0, sigma = 0.35, score = 0) {
    const next = Math.max(0, Math.min(1, mu * 0.85 + score * 0.25))
    return { mu: next, sigma }
}

app.get('/api/next', (req, res) => {
    const user_id = String(req.query.user_id || 'local-user')
    const U = getUser(user_id)

    // ensure progress rows
    for (const f of lessons) U.progress[f.lesson_id] ||= { attempts: 0, last_score: 0 }

    // first non-mastered lesson
    for (const f of lessons) {
        const prog = U.progress[f.lesson_id]
        const mastered = avgMastery(U.mastery, f.skills) >= TARGET && prog.attempts >= MIN_PRACTICE
        if (!mastered) {
            if (prog.attempts === 0) {
                // theory card
                return res.json({
                    item: {
                        id: `theory_${f.lesson_id}`,
                        arena: 'foundations',
                        mode: 'reflection',
                        prompt: `Read this lesson and note one concrete checkpoint you will use.\n\n${f.body.slice(0, 1200)}`,
                        payload: {},
                        skills: f.skills,
                        answer: {}
                    }
                })
            } else {
                // practice: choose an item that trains any of the lesson skills; otherwise any item
                const pool = items.filter(it => it.skills?.some(s => f.skills.includes(s)))
                const pick = (pool.length ? pool : items)[Math.floor(Math.random() * (pool.length ? pool.length : items.length))]
                return res.json({ item: pick })
            }
        }
    }
    res.json({ item: null }) // all mastered
})

app.post('/api/submit', (req, res) => {
    const { user_id = 'local-user', item_id, response, score } = req.body || {}
    const U = getUser(user_id)

    // derive a simple score if not provided (works for mcq/write/read)
    let s = typeof score === 'number' ? score : 0.5
    try {
        if (item_id && item_id.startsWith('theory_')) s = 1
        else if (response?.key !== undefined) {
            // mcq path
            const game = items.find(g => g.id === item_id)
            s = (response.key === game?.correct_index) ? 1 : 0
        } else if (typeof response?.text === 'string') {
            const words = response.text.trim().split(/\s+/).filter(Boolean).length
            s = words === 0 ? 0 : words < 30 ? 0.5 : 1
        }
    } catch { s = 0.5 }

    // bump mastery for any skills we can infer
    let skills = []
    const theory = /^theory_(.+)$/.exec(item_id)
    if (theory) {
        const f = lessons.find(x => x.lesson_id === theory[1]); skills = f?.skills || []
        const P = U.progress[f.lesson_id]; P.attempts++; P.last_score = s
    } else {
        const game = items.find(g => g.id === item_id)
        skills = game?.skills || []
        // best-effort: find a lesson that teaches one of these skills and bump its attempts
        const f = lessons.find(x => x.skills.some(k => skills.includes(k)))
        if (f) { const P = U.progress[f.lesson_id]; P.attempts++; P.last_score = s }
    }

    for (const sid of skills) {
        const cur = { mu: U.mastery[sid] || 0, sigma: 0.35 }
        U.mastery[sid] = updateMastery(cur.mu, cur.sigma, s).mu
    }

    res.json({ ok: true, score: s })
})

app.get('/api/progress', (req, res) => {
    const user_id = String(req.query.user_id || 'local-user')
    const U = getUser(user_id)
    const rows = lessons.map(f => ({
        ord: f.ord, lesson_id: f.lesson_id, title: f.title, skills: f.skills,
        ...U.progress[f.lesson_id]
    }))
    res.json({ rows })
})
