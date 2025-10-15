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
    path.resolve('game things', 'sigil-syntax', 'influences.json'),
    path.resolve('game thingss', 'sigil-syntax', 'influences.json')
)

export function readInfluences() {
    try {
        const raw = fs.readFileSync(FILE, 'utf8')
        const obj = JSON.parse(raw)
        return Array.isArray(obj) ? obj : (obj?.items || [])
    } catch {
        return []
    }
}
