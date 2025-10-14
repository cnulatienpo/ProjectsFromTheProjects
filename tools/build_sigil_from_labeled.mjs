import fs from 'fs'
import path from 'path'

const GT = 'game things'
const LAB = 'labeled data'
const TWEET = path.join(LAB, 'tweetrunk_renumbered')
const OUTDIR = path.resolve(GT, 'build', 'sigil-syntax')
fs.mkdirSync(OUTDIR, { recursive: true })

// Optional CSV/JSON “same data” reconciliation in game things/
// We take CSV if present, else JSON; if both, prefer CSV.
function readMaybe(p){ try { return fs.readFileSync(p,'utf8') } catch { return null } }
function parseCSV(txt){
  if (!txt) return []
  const [head, ...rows] = txt.trim().split(/\r?\n/)
  const cols = head.split(',').map(s=>s.trim())
  return rows.map(line => {
    const vals = line.split(',').map(s=>s.trim())
    const o = {}; cols.forEach((k,i)=>o[k]=vals[i]); return o
  })
}

// Load lessons from tweetrunk_renumbered: sort numerically by leading digits
function listTweetLessons(dir){
  if (!fs.existsSync(dir)) return []
  const files = fs.readdirSync(dir).filter(f => /\.(jsonl|json)$/i.test(f))
  const withOrder = files.map(f => {
    const m = f.match(/^(\d+)/); const n = m ? parseInt(m[1],10) : Number.MAX_SAFE_INTEGER
    return { f, n }
  }).sort((a,b)=>a.n - b.n)
  return withOrder.map(x => path.join(dir, x.f))
}

function readJSONL(p) {
  const items = []
  const lines = readMaybe(p)?.split('\n') || []
  for (let i=0;i<lines.length;i++){
    const t = lines[i].trim(); if (!t) continue
    try { items.push(JSON.parse(t)) } catch { /* skip */ }
  }
  return items
}

function normalizeWriteItem(obj, idx){
  // Expect an object with at least prompt or text; fallback sane defaults
  const id = obj.id || `w:${idx+1}`
  const prompt = obj.prompt_html || obj.prompt || obj.text || ''
  const minWords = Number(obj.min_words ?? 30)
  return {
    id: `sigil:${id}`,
    title: obj.title || `Sigil_&_Syntax — Lesson ${idx+1}`,
    input_type: obj.input_type || 'write',
    prompt_html: typeof prompt === 'string' ? prompt : String(prompt),
    min_words: minWords
  }
}

function main(){
  // 1) Optional index data from game things/ if you need it later (csv/json parity)
  const csv = readMaybe(path.join(GT,'cut_games_items_index.csv'))
  const json = readMaybe(path.join(GT,'cut_games_game_blueprints.json'))
  const indexRows = csv ? parseCSV(csv) : (json ? JSON.parse(json) : [])

  // 2) Lessons from tweetrunk_renumbered
  const lessonFiles = listTweetLessons(TWEET)
  let items = []
  let order = 1
  for (const p of lessonFiles) {
    if (p.endsWith('.jsonl')) {
      const arr = readJSONL(p).map((o, i) => normalizeWriteItem(o, items.length + i))
      items.push(...arr)
    } else {
      try {
        const obj = JSON.parse(fs.readFileSync(p,'utf8'))
        const arr = Array.isArray(obj) ? obj : (obj.items || obj.lessons || [obj])
        items.push(...arr.map((o,i)=>normalizeWriteItem(o, items.length + i)))
      } catch { /* skip bad file */ }
    }
    order++
  }

  // ensure first served lesson is first item (lowest number already first)
  const bundle = { kind: 'sigil-syntax', version: 1, count: items.length, first: items[0]?.id, items }
  fs.writeFileSync(path.join(OUTDIR, 'bundle_sigil_syntax.json'), JSON.stringify(bundle,null,2), 'utf8')
  console.log('✅ Wrote', path.join(OUTDIR, 'bundle_sigil_syntax.json'))
}
main()

