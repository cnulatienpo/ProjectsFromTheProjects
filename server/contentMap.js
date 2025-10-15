import fs from 'fs'
import path from 'path'
const MAP_PATH = path.resolve('server/data/foundation_skill_map.json')
let warnedMissing = false

function readMap() {
    if (!fs.existsSync(MAP_PATH)) {
        if (!warnedMissing) {
            console.warn('[opt] foundation_skill_map.json missing — returning empty content map')
            warnedMissing = true
        }
        return {}
    }

    try {
        const txt = fs.readFileSync(MAP_PATH, 'utf8')
        return JSON.parse(txt)
    } catch (e) {
        console.error('Failed to read content map:', e.message)
        return {}
    }
}

export function listSkills() {
    const map = readMap()
    return Object.keys(map)
}

export function unitsForSkill(skill) {
    const map = readMap()
    return map[skill] || []
}

/** Pick the next unit for a skill (very simple placeholder policy) */
export function nextUnitForSkill(skill, history = []) {
    const units = unitsForSkill(skill)
    const remaining = units.filter(u => !history.includes(u))
    return (remaining[0] || units[0] || null)
}
