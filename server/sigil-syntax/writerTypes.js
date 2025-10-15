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
    path.resolve('game things', 'sigil-syntax', 'writer_types.json'),
    path.resolve('game thingss', 'sigil-syntax', 'writer_types.json')
)
function safeRead() {
    try { return JSON.parse(fs.readFileSync(FILE, 'utf8')) } catch { return { version: 0, items: [] } }
}
export function listWriterTypes() {
    const b = safeRead(); return (b.items || []).map(x => x.id)
}
export function getWriterType(id) {
    const b = safeRead(); return (b.items || []).find(x => x.id === id) || null
}
export function allWriterTypes() {
    const b = safeRead(); return b.items || []
}
