import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

const PACKS_DIR = path.resolve('game thingss', 'packs')
const BUILD_DIR = path.resolve('game thingss', 'build')
const FOUNDATIONS_JSONL = path.resolve('game thingss', 'foundations.jsonl')
const SKILL_MAP_JSON = path.resolve('game thingss', 'foundation_skill_map.json')
const SKIP_FOUNDATIONS = true

if (SKIP_FOUNDATIONS) {
    console.warn('[opt] foundations/skill map disabled; skipping foundations import')
}
const LOG_FILE = path.resolve('tools', 'import.log')

// Ensure build dir exists
fs.mkdirSync(BUILD_DIR, { recursive: true })

function nowStamp() {
    const d = new Date()
    return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}_${String(d.getHours()).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}${String(d.getSeconds()).padStart(2, '0')}`
}

function safeParse(line, file, lineno, errors) {
    try {
        return JSON.parse(line)
    } catch (e) {
        errors.push(`[${file}:${lineno}] ${e.message}: ${line}`)
        return null
    }
}

function normalizeItem(obj) {
    return {
        id: obj.id ?? '',
        title: obj.title ?? '',
        input_type: obj.input_type ?? '',
        prompt_html: obj.prompt_html ?? '',
        skill: obj.skill ?? null,
        unit: obj.unit ?? null,
        choices: Array.isArray(obj.choices) ? obj.choices : [],
        correct_index: typeof obj.correct_index === 'number' ? obj.correct_index : 0,
        min_words: obj.min_words ?? null,
        tags: Array.isArray(obj.tags) ? obj.tags : [],
        next: obj.next ?? null
    }
}

function normalizeLesson(obj, skillMap) {
    const tags = Array.isArray(obj.tags) ? obj.tags : []
    const skills = Array.from(new Set(tags.flatMap(t => skillMap[t] || [])))
    return {
        lesson_id: obj.lesson_id ?? '',
        ord: Number(obj.order ?? obj.ord ?? 0),
        title: obj.title ?? '',
        body: obj.body ?? '',
        skills
    }
}

// Read all packs
const errors = []
const itemsById = {}
let totalItems = 0

for (const file of fs.readdirSync(PACKS_DIR).filter(f => f.endsWith('.jsonl'))) {
    const fullPath = path.join(PACKS_DIR, file)
    const lines = fs.readFileSync(fullPath, 'utf8').split('\n')
    lines.forEach((line, i) => {
        if (!line.trim()) return
        const obj = safeParse(line, file, i + 1, errors)
        if (!obj) return
        if (!obj.id || !obj.title || !obj.input_type || !obj.prompt_html) {
            errors.push(`[${file}:${i + 1}] Missing required fields: ${line}`)
            return
        }
        itemsById[obj.id] = normalizeItem(obj)
        totalItems++
    })
}

// Read foundations and skill map if present
let lessons = []
let skillMap = {}
if (!SKIP_FOUNDATIONS) {
    if (fs.existsSync(SKILL_MAP_JSON)) {
        skillMap = JSON.parse(fs.readFileSync(SKILL_MAP_JSON, 'utf8'))
    }
    if (fs.existsSync(FOUNDATIONS_JSONL)) {
        const lines = fs.readFileSync(FOUNDATIONS_JSONL, 'utf8').split('\n')
        lessons = lines
            .map((line, i) => safeParse(line, 'foundations.jsonl', i + 1, errors))
            .filter(Boolean)
            .map(obj => normalizeLesson(obj, skillMap))
    }
}

// Write bundle
const bundle = {
    version: 1,
    generated_at: new Date().toISOString(),
    items: Object.values(itemsById),
    lessons,
    skills_map: skillMap
}
const bundleFile = path.join(BUILD_DIR, `bundle-${nowStamp()}.json`)
fs.writeFileSync(bundleFile, JSON.stringify(bundle, null, 2))
fs.writeFileSync(path.join(BUILD_DIR, 'bundle.json'), JSON.stringify(bundle, null, 2))

// Write manifest
const manifest = {
    version: 1,
    generated_at: bundle.generated_at,
    item_count: bundle.items.length,
    lesson_count: bundle.lessons.length
}
fs.writeFileSync(path.join(BUILD_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2))

// Write errors log
if (errors.length) {
    fs.writeFileSync(LOG_FILE, errors.join('\n'))
} else {
    fs.writeFileSync(LOG_FILE, '')
}

console.log(`Wrote bundle.json (${bundle.items.length} items, ${bundle.lessons.length} lessons). See tools/import.log for any issues.`)
