import fs from 'fs'
import path from 'path'

function firstExisting(...paths) {
    for (const p of paths) {
        if (fs.existsSync(p)) return p
    }
    return null
}

const LEVELS_JSON = firstExisting(
    path.resolve('game things', 'sigil-syntax', 'levels.json'),
    path.resolve('game thingss', 'sigil-syntax', 'levels.json')
)
const BADGES_JSON = firstExisting(
    path.resolve('game things', 'sigil-syntax', 'badges.json'),
    path.resolve('game thingss', 'sigil-syntax', 'badges.json')
)

const DEFAULT_LEVELS = [
    { id: 1, code: 'rookie', title: 'Rookie', xp_threshold: 0, perk: 'Begin your Sigil_&_Syntax journey.' },
    { id: 2, code: 'novice', title: 'Novice', xp_threshold: 100, perk: 'Unlocks basic practice sets.' },
    { id: 3, code: 'apprentice', title: 'Apprentice', xp_threshold: 250, perk: 'Grants access to intermediate drills.' },
    { id: 4, code: 'journeyman', title: 'Journeyman', xp_threshold: 500, perk: 'Opens advanced gauntlets.' },
    { id: 5, code: 'adept', title: 'Adept', xp_threshold: 800, perk: 'Marks you as a Sigil mentor.' }
]
const DEFAULT_BADGES = [
    { id: 'first_write', title: 'First Draft Down', desc: 'Submit your first write.', criteria: { type: 'attempt_count', count: 1 } },
    { id: 'three_reads', title: 'Close Reader', desc: 'Complete 3 read tasks.', criteria: { type: 'attempt_count', count: 3 } },
    { id: 'mcq_streak_5', title: 'On a Roll', desc: '5 MCQs correct in a row.', criteria: { type: 'first_try_high_score' } }
]

function safeJSON(p, fallback, what) {
    if (!p) {
        console.warn(`[progression] ${what}.json missing → using defaults`)
        return fallback
    }
    try {
        const raw = fs.readFileSync(p, 'utf8')
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) return parsed
        if (Array.isArray(parsed?.levels)) return parsed.levels
        if (Array.isArray(parsed?.badges)) return parsed.badges
        console.warn(`[progression] ${what}.json (${p}) missing expected array → using defaults`)
        return fallback
    } catch (e) {
        console.warn(`[progression] Failed to parse ${what}.json (${p}): ${e.message} → using defaults`)
        return fallback
    }
}

function normalizeLevel(row, idx) {
    const id = Number.isFinite(row?.id) ? row.id : idx + 1
    const title = typeof row?.title === 'string' && row.title.trim() ? row.title.trim() : (typeof row?.name === 'string' && row.name.trim() ? row.name.trim() : `Level ${id}`)
    const code = typeof row?.code === 'string' && row.code.trim()
        ? row.code.trim()
        : title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `level-${id}`
    const xp_threshold_raw = row?.xp_threshold ?? row?.threshold ?? row?.xp ?? 0
    const xp_threshold = Number.isFinite(xp_threshold_raw) ? xp_threshold_raw : parseInt(xp_threshold_raw, 10)
    const perk = typeof row?.perk === 'string' && row.perk.trim() ? row.perk.trim() : (typeof row?.rule === 'string' ? row.rule : '')
    return {
        id,
        code,
        title,
        xp_threshold: Number.isFinite(xp_threshold) ? xp_threshold : 0,
        perk
    }
}

function normalizeCriteria(criteria) {
    if (!criteria || typeof criteria !== 'object') return { type: 'attempt_count', count: 1 }
    switch (criteria.type) {
        case 'attempt_count':
        case 'daily_streak':
        case 'mastery_count':
        case 'family_presence_in_session':
        case 'solid_in_family':
        case 'time_bonus_count':
            return { ...criteria, count: Number.isFinite(criteria.count) ? criteria.count : parseInt(criteria.count, 10) || 0 }
        case 'solid_combo':
            return { type: 'solid_combo', beats: Array.isArray(criteria.beats) ? criteria.beats : [] }
        case 'first_try_high_score':
        case 'no_hint_run':
            return { type: criteria.type }
        default:
            return { type: 'attempt_count', count: 1 }
    }
}

function normalizeBadge(row, idx) {
    const id = typeof row?.id === 'string' && row.id.trim() ? row.id.trim() : (typeof row?.key === 'string' && row.key.trim() ? row.key.trim() : `badge-${idx + 1}`)
    const title = typeof row?.title === 'string' && row.title.trim() ? row.title.trim() : (typeof row?.label === 'string' ? row.label : `Badge ${idx + 1}`)
    const desc = typeof row?.desc === 'string' && row.desc.trim() ? row.desc.trim() : (typeof row?.rule === 'string' ? row.rule : '')
    const xpBonusRaw = row?.xp_bonus ?? row?.bonus
    const xp_bonus = Number.isFinite(xpBonusRaw) ? xpBonusRaw : (xpBonusRaw != null ? parseInt(xpBonusRaw, 10) : undefined)
    return {
        id,
        title,
        desc,
        xp_bonus: Number.isFinite(xp_bonus) ? xp_bonus : undefined,
        criteria: normalizeCriteria(row?.criteria)
    }
}

export function loadLevels() {
    return safeJSON(LEVELS_JSON, DEFAULT_LEVELS, 'levels').map((row, idx) => normalizeLevel(row, idx))
}

export function loadBadges() {
    return safeJSON(BADGES_JSON, DEFAULT_BADGES, 'badges').map((row, idx) => normalizeBadge(row, idx))
}

const LEVELS = loadLevels()
const BADGES = loadBadges()

export function allLevels() { return LEVELS }
export function allBadges() { return BADGES }

export function levelForXp(xp = 0) {
    const value = Number.isFinite(xp) ? xp : parseInt(xp, 10) || 0
    let lvl = LEVELS[0]
    for (const row of LEVELS) {
        if (value >= (row.xp_threshold ?? 0)) lvl = row
        else break
    }
    return lvl
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
