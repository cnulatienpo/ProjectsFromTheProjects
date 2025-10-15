import fs from 'fs'
import path from 'path'

// NOTE: prefers `game things/...`; falls back to legacy `game thingss/...`.

function firstExisting(...paths) {
    for (const p of paths) {
        if (fs.existsSync(p)) return p
    }
    return paths[0]
}

function readJsonOrNull(p) {
    try { return JSON.parse(fs.readFileSync(p, 'utf8')) } catch { return null }
}

const L_JSON = firstExisting(
    path.resolve('game things', 'sigil-syntax', 'levels.json'),
    path.resolve('game thingss', 'sigil-syntax', 'levels.json')
)
const B_JSON = firstExisting(
    path.resolve('game things', 'sigil-syntax', 'badges.json'),
    path.resolve('game thingss', 'sigil-syntax', 'badges.json')
)

let LEVELS = readJsonOrNull(L_JSON)
let BADGES = readJsonOrNull(B_JSON)

function sanitizeTS(tsText) {
    return tsText
        .replace(/^import.*$/gm, '')
        .replace(/^export\s+type.*$/gm, '')
        .replace(/^export\s+default\s*/gm, '')
        .replace(/^export\s+const\s+\w+\s*=\s*/gm, '')
        .replace(/\s+as\s+const\s*;?/g, '')
        .replace(/;$/gm, '')
        .trim()
}

function parseTSFile(tsPath, name) {
    try {
        const raw = fs.readFileSync(tsPath, 'utf8')
        const sanitized = sanitizeTS(raw)
        return JSON.parse(sanitized)
    } catch (e) {
        console.warn(`[progression] Failed to parse ${name}: ${e.message}`)
        return []
    }
}

if (!LEVELS) {
    console.warn('[progression] levels.json missing, trying to read TypeScript source. Run: npm run emit:progression')
    LEVELS = parseTSFile(path.resolve('app/src/ai/sigil-syntax/levels.ts'), 'levels.ts')
}
if (!BADGES) {
    console.warn('[progression] badges.json missing, trying to read TypeScript source. Run: npm run emit:progression')
    BADGES = parseTSFile(path.resolve('app/src/ai/sigil-syntax/badges.ts'), 'badges.ts')
}

export function allLevels() { return LEVELS }
export function allBadges() { return BADGES }

export function levelForXp(xp = 0) {
    let lvl = 1
    for (const row of LEVELS) {
        if (xp >= (row.xp_threshold ?? 0)) lvl = row.id
        else break
    }
    const def = LEVELS.find(r => r.id === lvl) || LEVELS[0]
    return { id: def.id, code: def.code, title: def.title, perk: def.perk, xp_threshold: def.xp_threshold }
}

export function checkBadges(userState) {
    const unlocked = []
    for (const b of BADGES) {
        const c = b.criteria || {}
        let ok = false
        switch (c.type) {
            case 'attempt_count':
                ok = (userState.attemptsTotal || 0) >= (c.count || 0)
                break
            case 'daily_streak':
                ok = (userState.streakDays || 0) >= (c.count || 0)
                break
            case 'family_presence_in_session':
                ok = (userState.session?.families?.size || 0) >= (c.count || 0)
                break
            case 'solid_in_family':
                ok = ((userState.session?.solidByFamily || {})[c.family] || 0) >= (c.count || 0)
                break
            case 'solid_combo': {
                const have = new Set(userState.session?.comboBeats || [])
                ok = Array.isArray(c.beats) && c.beats.every(x => have.has(x))
                break
            }
            case 'mastery_count':
                ok = (userState.masteredBeats || 0) >= (c.count || 0)
                break
            case 'time_bonus_count':
                ok = (userState.session?.timeBonuses || 0) >= (c.count || 0)
                break
            case 'first_try_high_score':
                ok = !!userState.session?.lastRun?.firstTryHigh
                break
            case 'no_hint_run':
                ok = userState.session?.lastRun?.usedHints === false
                break
            default:
                ok = false
        }
        if (ok && !userState.badges?.has(b.id)) unlocked.push(b)
    }
    return unlocked
}
