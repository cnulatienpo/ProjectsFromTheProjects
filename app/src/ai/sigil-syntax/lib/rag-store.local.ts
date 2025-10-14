export type StoreDoc = { id: string; title: string; text: string; tags?: string[] }

export const DOCS: StoreDoc[] = [
  {
    id: 'beats-basic',
    title: 'Scene Beats — Basics',
    text: 'Opening image sets tone. Inciting incident disrupts normal. Stakes rise. Reversal complicates. Climax demands choice. Resolution sets new normal.',
    tags: ['structure', 'beats', 'level:1'],
  },
  {
    id: 'voice-choices',
    title: 'Voice & Choice Quick Guide',
    text: 'Voice comes from diction, rhythm, POV distance, and patterned choices. Avoid paste-gloss: sudden style shifts with no causal reason.',
    tags: ['voice', 'style', 'level:1-3'],
  },
  {
    id: 'devices',
    title: 'Device Layering',
    text: 'Layer metaphor, foreshadowing, reversal, motif. Devices must support pressure, not decorate. Echo a chosen device twice to make it felt.',
    tags: ['devices', 'structure', 'level:2-4'],
  },
]

export function retrieveRelevant(query: string, k = 4): StoreDoc[] {
  const q = (query || '').toLowerCase()
  const score = (t: string) => {
    const words = new Set(q.split(/\W+/).filter(Boolean))
    let hit = 0
    for (const w of words) if (t.toLowerCase().includes(w)) hit++
    return words.size ? hit / Math.max(6, words.size) : 0
  }
  return [...DOCS]
    .map((d) => ({ d, s: (score(d.title) + score(d.text)) / 2 }))
    .sort((a, b) => b.s - a.s)
    .slice(0, k)
    .map((x) => x.d)
}
