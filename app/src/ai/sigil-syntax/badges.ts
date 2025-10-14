export type BadgeCriteria =
  | { type: 'attempt_count'; count: number }
  | { type: 'daily_streak'; count: number }
  | { type: 'mastery_count'; count: number }
  | { type: 'family_presence_in_session'; count: number }
  | { type: 'solid_in_family'; family: string; count: number }
  | { type: 'solid_combo'; beats: string[] }
  | { type: 'time_bonus_count'; count: number }
  | { type: 'first_try_high_score' }
  | { type: 'no_hint_run' }

export type BadgeRow = {
  id: string
  title: string
  desc: string
  xp_bonus?: number
  criteria: BadgeCriteria
}

export const badges: BadgeRow[] = [
  {
    id: 'starter',
    title: 'Ink Starter',
    desc: 'Finish three Sigil_&_Syntax attempts in a single night.',
    xp_bonus: 40,
    criteria: { type: 'attempt_count', count: 3 },
  },
  {
    id: 'streak-5',
    title: 'Five-Day Cipher',
    desc: 'Show up five nights in a row.',
    xp_bonus: 75,
    criteria: { type: 'daily_streak', count: 5 },
  },
  {
    id: 'solid-structure',
    title: 'Structure Solid',
    desc: 'Earn three Structure “solid” ratings in one session.',
    xp_bonus: 60,
    criteria: { type: 'solid_in_family', family: 'structure', count: 3 },
  },
  {
    id: 'combo-devices',
    title: 'Device Combo',
    desc: 'Chain metaphor, foreshadowing, and motif in a single attempt.',
    xp_bonus: 90,
    criteria: { type: 'solid_combo', beats: ['metaphor', 'foreshadow', 'motif'] },
  },
]

export default badges
