// server/attempt/analyze.js
export function analyzeAttempt(text = '', { minWords = 30 } = {}) {
    const raw = String(text || '')
    const words = raw.trim() ? raw.trim().split(/\s+/).length : 0

    // quick heuristics that match your live Feedback tray
    const passes = {
        length: words >= minWords,
        desire: /\bwants?\b|\bdesire\b/i.test(raw),
        obstacle: /\bbut\b|\bobstacle\b|\bagainst\b/i.test(raw),
        sensory: /\bsmell\b|\bsound\b|\btaste\b|\btouch\b|\bsight\b/i.test(raw),
    }

    const rubric = [
        { key: 'length', label: `Meets length (${minWords}+ words)`, ok: passes.length },
        { key: 'desire', label: 'Clear desire present', ok: passes.desire },
        { key: 'obstacle', label: 'Obstacle specified', ok: passes.obstacle },
        { key: 'sensory', label: 'Includes one sensory detail', ok: passes.sensory },
    ]

    const suggestions = []
    if (!passes.desire) suggestions.push('State plainly what the character wants.')
    if (!passes.obstacle) suggestions.push('Add a specific obstacle that blocks the goal.')
    if (!passes.sensory) suggestions.push('Work in one sensory detail (sound/smell/taste/touch/sight).')
    if (!passes.length) suggestions.push(`Write ${minWords - words} more word(s) to meet the target.`)

    // inline spans (rudimentary; UI can ignore for now)
    const spans = []

    // verdict + tiny gamification stub
    const okCount = rubric.filter(r => r.ok).length
    const verdict = okCount >= 3 ? 'pass' : 'revise'
    const badge = okCount >= 4 ? { type: 'green-check', label: 'Solid Fundamentals' } : null
    const level = { up: verdict === 'pass', to: verdict === 'pass' ? 'Lv. 2' : null }

    // “Ray Ray” memo lines
    const memo = (suggestions.length
        ? ['Start here:', ...suggestions]
        : ['Nice! Tighten one sentence for punch and keep going.'])

    return {
        verdict,
        counts: { words, minWords },
        rubric,
        spans,
        memo,      // ← this feeds “Ray Ray Says”
        badge,
        level
    }
}
