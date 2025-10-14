export type ReportPhraseBundle = {
  closers: {
    low: string[]
    mid: string[]
    high: string[]
  }
  tags: Record<string, string[]>
  praise: string[]
  generic: string[]
}

export const reportPhrases: ReportPhraseBundle = {
  closers: {
    low: [
      'Next: keep it small — make one beat unavoidable.',
      'Next: spotlight the decision that costs your character the most.',
    ],
    mid: [
      'Next: tighten two sentences and lock the turn in place.',
      'Next: pick one device and echo it twice for weight.',
    ],
    high: [
      'Next: raise the stakes by adding consequence to the final beat.',
      'Next: share this draft with your cohort — it is ready for outside eyes.',
    ],
  },
  tags: {
    clarity: [
      'Clarity drops when time and place slide. Anchor the reader in the opening line.',
      'Your nouns are working; now make sure each pronoun has a crisp antecedent.',
    ],
    voice: [
      'Voice feels lived-in. Keep swapping filler verbs for ones that reveal intent.',
      'Let the rhythm snap like spoken word; read aloud and trim the mush.',
    ],
    devices: [
      'You plant devices but abandon them. Echo one metaphor so it lands.',
      'Device work is sharp — thread it through the turn for a clean payoff.',
    ],
  },
  praise: ['Clean execution. Your control is showing — keep the heat on.'],
  generic: ['Tighten one verb and one noun to sharpen the signal.'],
}

export default reportPhrases
