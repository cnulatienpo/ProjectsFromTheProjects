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
    path.resolve('game things', 'sigil-syntax', 'reportTypes.json'),
    path.resolve('game thingss', 'sigil-syntax', 'reportTypes.json')
)

function readBundle() {
    try { return JSON.parse(fs.readFileSync(FILE, 'utf8')) } catch { return { version: 0, reportTypes: [] } }
}

export function listReportTypes() {
    return readBundle().reportTypes.map(r => r.id)
}

export function getReportType(id) {
    return readBundle().reportTypes.find(r => r.id === id) || null
}

export function defaultReportType() {
    const all = readBundle().reportTypes
    return all.find(r => r.default) || all[0] || null
}
