import fs from 'fs'
import path from 'path'

// NOTE: prefers `game things/...`; falls back to legacy `game thingss/...`.

function firstExisting(...paths) {
    for (const p of paths) {
        if (fs.existsSync(p)) return p
    }
    return paths[0]
}

const FILE = firstExisting(
    path.resolve('game things', 'sigil-syntax', 'reportPhrases.json'),
    path.resolve('game thingss', 'sigil-syntax', 'reportPhrases.json')
)

const FALLBACK = {
    closers: {
        low: ['Next: do a shorter pass—make one sentence spine obvious.'],
        mid: ['Next: keep the spine, swap 1 weak verb and cut 5 words.'],
        high: ['Next: raise the stakes—add one obstacle without breaking clarity.']
    },
    tags: {},
    praise: ['Clean pass.'],
    generic: ['Tighten one verb and one noun.']
}

export function readReportPhrases() {
    try {
        const raw = fs.readFileSync(FILE, 'utf8')
        const obj = JSON.parse(raw)
        return {
            ...FALLBACK, ...obj,
            closers: { ...FALLBACK.closers, ...(obj.closers || {}) },
            tags: { ...(obj.tags || {}) },
            praise: obj.praise || FALLBACK.praise,
            generic: obj.generic || FALLBACK.generic
        }
    } catch { return FALLBACK }
}
