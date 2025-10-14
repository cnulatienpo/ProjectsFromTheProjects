import fs from 'fs'
import path from 'path'

const ROOTS = ['game thingss', 'game things']
const BASE = ROOTS.find(d => fs.existsSync(d)) || 'game thingss'
const CUT_FILE  = path.resolve(BASE, 'build', 'bundle_cut_game.json')
const GOOD_FILE = path.resolve(BASE, 'build', 'bundle_good_word.json')

function safeRead(p, fallback = { items: [] }) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')) } catch { return fallback }
}

export function listCutIds() {
  const b = safeRead(CUT_FILE); return (b.items || []).map(x => x.id)
}
export function getCutItem(id) {
  const b = safeRead(CUT_FILE); return (b.items || []).find(x => x.id === id) || null
}

export function listGoodIds() {
  const b = safeRead(GOOD_FILE); return (b.items || []).map(x => x.id)
}
export function getGoodItem(id) {
  const b = safeRead(GOOD_FILE); return (b.items || []).find(x => x.id === id) || null
}
