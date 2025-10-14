export type LevelRow = {
  id: number
  code: string
  title: string
  xp_threshold: number
  perk: string
}

export const levels: LevelRow[] = [
  {
    id: 1,
    code: 'scribe',
    title: 'Street Scribe',
    xp_threshold: 0,
    perk: 'Unlocks the first Sigil_&_Syntax gauntlet.',
  },
  {
    id: 2,
    code: 'schemer',
    title: 'Plot Schemer',
    xp_threshold: 200,
    perk: 'Access to extended device drills.',
  },
  {
    id: 3,
    code: 'conjurer',
    title: 'Line Conjurer',
    xp_threshold: 450,
    perk: 'Earns a bonus prompt pack each week.',
  },
  {
    id: 4,
    code: 'architect',
    title: 'Narrative Architect',
    xp_threshold: 750,
    perk: 'Unlocks revision simulators.',
  },
  {
    id: 5,
    code: 'mythmaker',
    title: 'Myth Maker',
    xp_threshold: 1100,
    perk: 'Badge that marks you as community mentor.',
  },
]

export default levels
