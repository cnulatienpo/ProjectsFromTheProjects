import fs from 'fs'
import path from 'path'

const ROOTS = ['game thingss', 'game things']
const BASE = (() => {
  for (const root of ROOTS) {
    if (fs.existsSync(path.resolve(root, 'cut_games_items_index.csv'))) return root
  }
  return ROOTS.find(d => fs.existsSync(d)) || 'game thingss'
})()
const OUTDIR = path.resolve(BASE, 'build')
fs.mkdirSync(OUTDIR, { recursive: true })

const P_CSV = path.resolve(BASE, 'cut_games_items_index.csv')
const P_BLUE = path.resolve(BASE, 'cut_games_game_blueprints.json')
const P_BAD = path.resolve(BASE, 'cut_games_practice_bad.jsonl')
const P_GOOD = path.resolve(BASE, 'cut_games_practice_good.jsonl')
const OUT = path.join(OUTDIR, 'bundle_cut_game.json')

function parseCSV(txt) {
  const [head, ...rows] = txt.trim().split(/\r?\n/)
  const cols = head.split(',').map(s=>s.trim())
  return rows.map(line => {
    const vals = line.split(',').map(s=>s.trim())
    const obj = {}; cols.forEach((k,i)=>obj[k]=vals[i]); return obj
  })
}
function parseJSONL(p) {
  const out = []
  const lines = fs.readFileSync(p,'utf8').split('\n')
  for (let i=0;i<lines.length;i++){
    const t = lines[i].trim(); if(!t) continue
    try { out.push(JSON.parse(t)) } catch(e){ console.warn('jsonl error', p, i+1) }
  }
  return out
}

function main(){
  const rawBlue = JSON.parse(fs.readFileSync(P_BLUE,'utf8'))
  const blue = Array.isArray(rawBlue)
    ? rawBlue
    : (Array.isArray(rawBlue.blueprints) ? rawBlue.blueprints : (Array.isArray(rawBlue.modes) ? rawBlue.modes : []))
  const indexRows = parseCSV(fs.readFileSync(P_CSV,'utf8')) // rows referencing items
  const bad = parseJSONL(P_BAD)  // “bad” examples / distractors
  const good = parseJSONL(P_GOOD) // “good” examples / references

  // Normalize items to a common game spec (we’ll render MCQ for now)
  const items = []
  for (const row of indexRows) {
    const id = String(row.id || row.item_id || items.length + 1)
    const title = row.title || row.prompt || `Cut Item ${id}`
    const blueprint = blue.find(b => (b.id === row.blueprint_id)) || null
    const stem = row.stem || blueprint?.stem || title
    const bads = bad.filter(x => (x.item_id || x.id) == id).map(x => x.text || x.choice || '').filter(Boolean)
    const goods = good.filter(x => (x.item_id || x.id) == id).map(x => x.text || x.answer || '').filter(Boolean)

    // Build an MCQ: one good (first), rest bads as distractors; shuffle later in UI if needed
    const answer = goods[0] || row.answer || '—'
    const choices = [answer, ...bads.slice(0,3)].filter(Boolean).slice(0,4)

    items.push({
      id: `cut:${id}`,
      title: `Cut Game — ${title}`,
      input_type: 'mcq',
      prompt_html: `<p>${stem}</p>`,
      choices,
      correct_index: 0
    })
  }

  const bundle = {
    kind: 'cut_game',
    version: 1,
    count: items.length,
    items
  }
  fs.writeFileSync(OUT, JSON.stringify(bundle,null,2), 'utf8')
  console.log('✅ Wrote', OUT)
}
main()
