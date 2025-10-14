export type InfluenceStyleGate = {
  min_words?: number
  max_words?: number
  max_adverbs?: number
  max_passiveHints?: number
  max_longSentences?: number
  note_includes?: string
}

export type InfluenceWhen = {
  input_type?: 'read' | 'write' | 'mcq' | 'highlight' | 'order'
  skill?: string
  tag?: string
  min_score?: number
  max_score?: number
  style?: InfluenceStyleGate
}

export type InfluenceRule = {
  id: string
  weight?: number
  when?: InfluenceWhen
  template?: string
  text?: string
  xp_bonus?: number
}

export const influenceCatalog: InfluenceRule[] = [
  {
    id: 'sigil:low-score-reset',
    weight: 1,
    when: { max_score: 0.5 },
    template: 'Score {score}. Reread the prompt and tighten one sensory line before resubmitting.',
  },
  {
    id: 'sigil:clarity-push',
    weight: 0.7,
    when: { input_type: 'write', style: { max_longSentences: 2 } },
    template: 'Your clarity hinges on trimming long sentences ({longSentences}). Slice one into two beats.',
  },
  {
    id: 'sigil:voice-cheer',
    weight: 0.6,
    when: { min_score: 0.8, style: { max_adverbs: 4 } },
    template: 'Voice is holding ({score}). Swap one -ly adverb ({adverbs}) for a concrete verb to sharpen.',
    xp_bonus: 15,
  },
  {
    id: 'sigil:structure',
    weight: 0.8,
    when: { skill: 'structure' },
    text: 'Make sure your turn costs the character something visible.',
  },
]

export default influenceCatalog
