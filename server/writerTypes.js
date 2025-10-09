import fs from 'fs'
import path from 'path'
const FILE = path.resolve('game thingss', 'writer_types.json')
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
