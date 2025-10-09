import fs from 'fs'
import path from 'path'

const BUILD_DIR = path.resolve('game thingss', 'build')
const BUNDLE_PATH = path.join(BUILD_DIR, 'bundle.json')

function findLatestBundle() {
    const files = fs.readdirSync(BUILD_DIR).filter(f => /^bundle-\d{8}_\d{6}\.json$/.test(f))
    if (!files.length) return null
    files.sort().reverse()
    return path.join(BUILD_DIR, files[0])
}

export function readBundle() {
    let bundle
    try {
        bundle = JSON.parse(fs.readFileSync(BUNDLE_PATH, 'utf8'))
    } catch {
        const fallback = findLatestBundle()
        if (fallback) bundle = JSON.parse(fs.readFileSync(fallback, 'utf8'))
        else bundle = { version: 0, generated_at: '', items: [], lessons: [], skills_map: {} }
    }
    return bundle
}

export function listItemIds() {
    const bundle = readBundle()
    return bundle.items.map(i => i.id)
}

export function getItem(id) {
    const bundle = readBundle()
    return bundle.items.find(i => i.id === id) || null
}

export function listLessons() {
    const bundle = readBundle()
    return bundle.lessons
}

export function getLesson(lesson_id) {
    const bundle = readBundle()
    return bundle.lessons.find(l => l.lesson_id === lesson_id) || null
}
