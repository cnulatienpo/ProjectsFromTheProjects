import fs from 'fs'
import path from 'path'
const R = (...s) => path.resolve(...s)

const ROOTS = {
    GT_NEW: 'game things',
    GT_OLD: 'game thingss',
    LAB: 'labeled data',
    SRV: R('server', 'data')
}

function firstExisting(...cands) {
    for (const p of cands) { if (fs.existsSync(p)) return p }
    return null
}

export const PATHS = {
    FOUNDATIONS_JSONL: firstExisting(
        R(ROOTS.GT_NEW, 'foundations.jsonl'),
        R(ROOTS.LAB, 'foundations.jsonl'),
        R(ROOTS.GT_OLD, 'foundations.jsonl')
    ),
    SKILL_MAP_JSON: firstExisting(
        R(ROOTS.GT_NEW, 'foundation_skill_map.json'),
        R(ROOTS.LAB, 'foundation_skill_map.json'),
        R(ROOTS.GT_OLD, 'foundation_skill_map.json')
    ),
    CATALOG_JSON: firstExisting(
        R(ROOTS.SRV, 'games_catalog.json'),
        R(ROOTS.GT_NEW, 'games_catalog.json'),
        R(ROOTS.GT_OLD, 'games_catalog.json')
    )
}

export function debugResolvedPaths() {
    const toEntry = (p) => ({ path: p, exists: !!p })
    return {
        FOUNDATIONS_JSONL: toEntry(PATHS.FOUNDATIONS_JSONL),
        SKILL_MAP_JSON: toEntry(PATHS.SKILL_MAP_JSON),
        CATALOG_JSON: toEntry(PATHS.CATALOG_JSON),
    }
}

import { PATHS } from './lib/resolvePaths.js'

let txt = ''
if (PATHS.FOUNDATIONS_JSONL) {
    txt = fs.readFileSync(PATHS.FOUNDATIONS_JSONL, 'utf8')
} else {
    console.warn('[opt] foundations.jsonl not found; continuing without foundations')
}

let map = {}
if (PATHS.SKILL_MAP_JSON) {
    try { map = JSON.parse(fs.readFileSync(PATHS.SKILL_MAP_JSON, 'utf8')) } catch { }
} else {
    console.warn('[opt] foundation_skill_map.json not found; continuing without skill map')
}
