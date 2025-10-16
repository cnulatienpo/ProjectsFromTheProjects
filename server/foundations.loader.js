// server/foundations.loader.js
// Optional/legacy foundations loader — safe no-op so imports won't crash.
export function loadFoundations() {
  console.warn('[opt] foundations loader called — returning empty data (tweetrunk is source of truth).')
  return { lessons: [], skillMap: {} }
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
