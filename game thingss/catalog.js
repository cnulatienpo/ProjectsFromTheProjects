import fs from 'fs'
import path from 'path'

// absolute path to the catalog file inside "game thingss"
const CATALOG_PATH = path.resolve('game thingss', 'games_catalog.json')

export function readCatalog() {
    try {
        const raw = fs.readFileSync(CATALOG_PATH, 'utf8')
        return JSON.parse(raw)
    } catch (e) {
        console.error('Failed to read games_catalog.json:', e.message)
        return { version: 0, games: {} }
    }
}

export function listGameIds() {
    const cat = readCatalog()
    return Object.keys(cat.games || {})
}

export function getGameDef(id) {
    const cat = readCatalog()
    return (cat.games && cat.games[id]) || null
}
