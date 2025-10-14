// Central judge for attempts: combines base score, style report, and influence rules
// to produce feedback, tags, and an XP delta (no SQL).

import { readInfluences } from './influences.js'        // from the first step (influences.json loader)
import { analyzeText } from './styleReport.js'           // our simple style analyzer
import { getItem } from '../bundle.js'                   // pulls a game by id from bundle/catalog

const clamp01 = (x) => Math.max(0, Math.min(1, x))

// Lightweight "when" matcher for influence rules.
// A rule can specify any of these (all must pass if present):
// - input_type: 'read' | 'write' | 'mcq' | 'highlight' | 'order'
// - skill: 'grammar' | 'devices' | 'structure' | ...
// - min_score / max_score: numeric 0..1 bounds on base or style-adjusted score
// - style: { min_words, max_words, max_adverbs, max_passiveHints, max_longSentences }
// - tag: require that game.tags includes this (if your bundle uses tags)
function whenMatches(when = {}, ctx) {
    const { game, baseScore, style } = ctx
    if (!when || typeof when !== 'object') return true

    if (when.input_type && game.input_type !== when.input_type) return false
    if (when.skill && game.skill !== when.skill) return false
    if (when.tag && !(Array.isArray(game.tags) && game.tags.includes(when.tag))) return false

    const s = Number(baseScore ?? 0)
    if (when.min_score != null && !(s >= Number(when.min_score))) return false
    if (when.max_score != null && !(s <= Number(when.max_score))) return false

    if (when.style && style) {
        const { words, sentences, notes } = style
        const adv = (style.adverbs ?? 0)
        const pas = (style.passiveHints ?? 0)
        const long = (style.longSentences ?? 0)
        const w = when.style
        if (w.min_words != null && !(words >= w.min_words)) return false
        if (w.max_words != null && !(words <= w.max_words)) return false
        if (w.max_adverbs != null && !(adv <= w.max_adverbs)) return false
        if (w.max_passiveHints != null && !(pas <= w.max_passiveHints)) return false
        if (w.max_longSentences != null && !(long <= w.max_longSentences)) return false
        // allow simple contains check on style note substrings
        if (w.note_includes) {
            const has = (notes || []).some(n => String(n).toLowerCase().includes(String(w.note_includes).toLowerCase()))
            if (!has) return false
        }
    }

    return true
}

function renderTemplate(tpl = '', ctx) {
    // Allow {score}, {words}, {sentences}, {adverbs}, {passiveHints}, {skill}, {title}
    const s = clamp01(Number(ctx.baseScore ?? 0))
    const st = ctx.style || {}
    const dict = {
        score: s.toFixed(2),
        words: st.words ?? 0,
        sentences: st.sentences ?? 0,
        adverbs: st.adverbs ?? 0,
        passiveHints: st.passiveHints ?? 0,
        longSentences: st.longSentences ?? 0,
        skill: ctx.game.skill || '',
        title: ctx.game.title || ctx.game.id || ''
    }
    return String(tpl).replace(/\{(\w+)\}/g, (_, k) => (k in dict ? String(dict[k]) : `{${k}}`))
}

/**
 * Evaluate an attempt.
 * @param {Object} input
 * @param {string} input.id             game id
 * @param {string|number|object|null} input.response  user response (text for write; {key} for mcq)
 * @param {number} input.baseScore      0..1 rough score from UI (optional)
 * @param {Object} input.userState      your in-memory user state (optional; future use)
 * @returns {{ score:number, xpDelta:number, feedback:string[], tags:string[], style?:object }}
 */
export function evaluateAttempt({ id, response, baseScore = 0.5, userState = {} } = {}) {
    const game = getItem(id)
    if (!game) throw Object.assign(new Error('unknown_game'), { code: 'unknown_game', id })

    // Derive/confirm baseScore if not supplied (works for mcq/write/read)
    let s = Number(baseScore)
    if (!Number.isFinite(s)) {
        if (game.input_type === 'mcq' && response && typeof response === 'object' && 'key' in response) {
            s = Number(response.key === game.correct_index) // 1 or 0
        } else if (game.input_type === 'write' && typeof response === 'string') {
            const wc = response.trim().split(/\s+/).filter(Boolean).length
            s = wc === 0 ? 0 : wc < (game.min_words ?? 30) ? 0.5 : 1
        } else {
            s = 1 // read/other modes default to pass
        }
    }
    s = clamp01(s)

    // Optional style analysis (only useful for text)
    let style = null
    if (typeof response === 'string') {
        style = analyzeText(response)
        // blend a tiny nudge from style.score if provided (soft influence)
        if (typeof style.score === 'number') {
            s = clamp01(s * 0.85 + style.score * 0.15)
        }
    }

    const ctx = { game, baseScore: s, style, response, userState }

    // Apply influences
    const rules = readInfluences()
    const picked = []
    let bonus = 0
    for (const inf of rules) {
        const ok = whenMatches(inf.when, ctx)
        if (!ok) continue
        const weight = Number(inf.weight ?? 1)
        const text = inf.template ? renderTemplate(inf.template, ctx) : (inf.text || '')
        if (text) picked.push({ text, weight, id: inf.id })
        if (inf.xp_bonus) bonus += Number(inf.xp_bonus) || 0
    }

    // Combine/scale feedback: sort by weight desc, take top N
    picked.sort((a, b) => (b.weight - a.weight))
    const feedback = picked.slice(0, 5).map(p => p.text)
    const tags = picked.map(p => p.id)

    // XP: base from score + any rule bonuses
    const xpBase = Math.round(s * 25)
    const xpDelta = Math.max(0, xpBase + Math.round(bonus))

    return { score: s, xpDelta, feedback, tags, style }
}
