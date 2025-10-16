// server/lib/resolvePaths.js
import fs from 'fs'
import path from 'path'

const R = (...s) => path.resolve(...s)

const ROOTS = {
    GT_NEW: 'game things',
    GT_OLD: 'game thingss',
    LAB: 'labeled data',
    SRV: R('server', 'data'),
}

function firstExistingPath(...candidates) {
    for (const p of candidates) {
        try { if (fs.existsSync(p)) return p } catch { }
    }
    return null
}

export const PATHS = {
    FOUNDATIONS_JSONL: firstExistingPath(
        R(ROOTS.GT_NEW, 'foundations.jsonl'),
        R(ROOTS.LAB, 'foundations.jsonl'),
        R(ROOTS.GT_OLD, 'foundations.jsonl')
    ),
    SKILL_MAP_JSON: firstExistingPath(
        R(ROOTS.GT_NEW, 'foundation_skill_map.json'),
        R(ROOTS.LAB, 'foundation_skill_map.json'),
        R(ROOTS.GT_OLD, 'foundation_skill_map.json')
    ),
    CATALOG_JSON: firstExistingPath(
        R(ROOTS.SRV, 'games_catalog.json'),
        R(ROOTS.GT_NEW, 'games_catalog.json'),
        R(ROOTS.GT_OLD, 'games_catalog.json')
    ),
}

export function debugResolvedPaths() {
    const toEntry = (p) => ({ path: p, exists: !!p && fs.existsSync(p) })
    return {
        FOUNDATIONS_JSONL: toEntry(PATHS.FOUNDATIONS_JSONL),
        SKILL_MAP_JSON: toEntry(PATHS.SKILL_MAP_JSON),
        CATALOG_JSON: toEntry(PATHS.CATALOG_JSON),
    }
}

export { firstExistingPath }
