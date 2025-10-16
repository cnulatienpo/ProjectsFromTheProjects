import fs from 'fs'
import path from 'path'

const OUT_DIR = path.resolve('game things', 'sigil-syntax')
fs.mkdirSync(OUT_DIR, { recursive: true })

const levels = [
  { id: 1, code: 'rookie', title: 'Rookie', xp_threshold: 0, perk: 'Begin your Sigil_&_Syntax journey.' },
  { id: 2, code: 'novice', title: 'Novice', xp_threshold: 100, perk: 'Unlocks basic practice sets.' },
  { id: 3, code: 'apprentice', title: 'Apprentice', xp_threshold: 250, perk: 'Grants access to intermediate drills.' },
  { id: 4, code: 'journeyman', title: 'Journeyman', xp_threshold: 500, perk: 'Opens advanced gauntlets.' },
  { id: 5, code: 'adept', title: 'Adept', xp_threshold: 800, perk: 'Marks you as a Sigil mentor.' }
]
const badges = [
  { id: 'first_write', title: 'First Draft Down', desc: 'Submit your first write.', criteria: { type: 'attempt_count', count: 1 } },
  { id: 'three_reads', title: 'Close Reader', desc: 'Complete 3 read tasks.', criteria: { type: 'attempt_count', count: 3 } },
  { id: 'mcq_streak_5', title: 'On a Roll', desc: '5 MCQs correct in a row.', criteria: { type: 'first_try_high_score' } }
]

fs.writeFileSync(path.join(OUT_DIR, 'levels.json'), JSON.stringify(levels, null, 2))
fs.writeFileSync(path.join(OUT_DIR, 'badges.json'), JSON.stringify(badges, null, 2))
console.log('✅ wrote', path.join(OUT_DIR, 'levels.json'), 'and', path.join(OUT_DIR, 'badges.json'))
