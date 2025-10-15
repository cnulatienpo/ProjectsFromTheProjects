let warned = false

function warnOnce() {
    if (!warned) {
        console.warn('[opt] foundations/skill map disabled; returning empty content map')
        warned = true
    }
}

export function listSkills() {
    warnOnce()
    return []
}

export function unitsForSkill(skill) {
    warnOnce()
    return []
}

/** Pick the next unit for a skill (very simple placeholder policy) */
export function nextUnitForSkill(skill, history = []) {
    warnOnce()
    return null
}
