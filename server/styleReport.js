export function analyzeText(text = '') {
    const raw = String(text || '')
    const words = raw.trim().split(/\s+/).filter(Boolean)
    const sentences = raw.split(/[.!?]+/).map(s => s.trim()).filter(Boolean)

    // simple checks
    const adverbs = (raw.match(/\b\w+ly\b/gi) || []).length
    const longSentences = sentences.filter(s => s.split(/\s+/).length > 25).length
    const passiveHints = (raw.match(/\b(is|are|was|were|be|been|being)\s+\w+ed\b/gi) || []).length

    const notes = []
    if (longSentences) notes.push(`You have ${longSentences} long sentence(s) (>25 words). Try cutting or adding a hinge.`)
    if (adverbs > 3) notes.push(`Lots of -ly adverbs (${adverbs}). Swap 1–2 for stronger verbs.`)
    if (passiveHints > 0) notes.push(`Passive-leaning constructions (~${passiveHints}). Make subjects act.`)
    if (!notes.length) notes.push(`Clean pass. Now tighten one verb and one noun.`)

    // crude score 0..1
    const score = Math.max(0, Math.min(1, 1 - (longSentences * 0.15 + adverbs * 0.03 + passiveHints * 0.1)))

    return { score, words: words.length, sentences: sentences.length, notes }
}
