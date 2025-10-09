import { readReportPhrases } from './reportPhrases.js'
// Make feedback evolve across attempts: avoid repeats, escalate focus, and suggest next action.

const MAX_FEEDBACK = 3

/**
 * Given prior judge outputs and the latest judge result, produce an evolved report.
 * @param {Array<{tags?:string[], feedback?:string[]}>} history  prior judge results (oldest→newest)
 * @param {{score:number, feedback:string[], tags:string[]}} latest judge result from evaluateAttempt()
 * @returns {{feedback:string[], tags:string[]}}
 */
export function evolveReport(history = [], latest) {
    const PH = readReportPhrases()
    const seenTags = new Set(history.flatMap(h => h?.tags || []))

    // 1) Prefer feedback with *new* tags
    const fresh = []
    const repeats = []
    for (const i of latest.tags || []) {
        (seenTags.has(i) ? repeats : fresh).push(i)
    }
    const orderedTags = [...fresh, ...repeats]

    // 2) Build evolved feedback list: prefer tag-specific phrases, drop duplicates
    const msgByTag = new Map()
        ; (latest.feedback || []).forEach((m, idx) => {
            const tag = latest.tags?.[idx] || `anon-${idx}`
            if (!msgByTag.has(tag)) msgByTag.set(tag, m)
        })

    const evolved = []
    for (const t of orderedTags) {
        const byTag = Array.isArray(PH.tags?.[t]) ? PH.tags[t] : null
        const msg = (byTag && byTag[0]) || msgByTag.get(t)
        if (msg && !evolved.includes(msg)) evolved.push(msg)
        if (evolved.length >= MAX_FEEDBACK) break
    }
    // if still empty, add one praise/generic line
    if (evolved.length === 0) {
        const p = PH.praise?.[0] || PH.generic?.[0]
        if (p) evolved.push(p)
    }

    // 4) Add a single actionable closer based on score band
    const s = Number(latest.score ?? 0)
    const pool = s < 0.4 ? PH.closers.low : s < 0.8 ? PH.closers.mid : PH.closers.high
    const closer = Array.isArray(pool) && pool.length ? pool[Math.floor(Math.random() * pool.length)] : null
    if (closer && !evolved.some(m => m.startsWith('Next:'))) evolved.push(closer)

    return { feedback: evolved.slice(0, MAX_FEEDBACK), tags: orderedTags.slice(0, MAX_FEEDBACK) }
}
