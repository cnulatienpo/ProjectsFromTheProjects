import fs from 'fs'
import path from 'path'

const FILE = path.resolve('game thingss', 'sigil-syntax', 'influences.json')

export function readInfluences() {
    try {
        const raw = fs.readFileSync(FILE, 'utf8')
        const obj = JSON.parse(raw)
        return Array.isArray(obj) ? obj : (obj?.items || [])
    } catch {
        return []
    }
}
