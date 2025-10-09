import fs from 'fs'
import path from 'path'
const FILE = path.resolve('game thingss', 'reportTypes.json')

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
