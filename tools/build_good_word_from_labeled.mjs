import fs from 'fs'
import path from 'path'

const LAB = 'labeled data'
const OUTDIR = path.resolve('game things', 'build')
fs.mkdirSync(OUTDIR, { recursive: true })

// Gather every “the-good-word-*.json” under labeled data
function listPacks(dir) {
  if (!fs.existsSync(dir)) return []
  const all = fs.readdirSync(dir).filter(f => f.endsWith('.json'))
  return all
    .filter(f => f.startsWith('the-good-word-')) // core + packs
    .map(f => path.join(dir, f))
}

const PACKS = listPacks(LAB)
const OUT = path.join(OUTDIR, 'bundle_good_word.json')

function loadAll(packs){
  const words = []
  for (const p of packs) {
    try {
      const obj = JSON.parse(fs.readFileSync(p,'utf8'))
      const arr = Array.isArray(obj) ? obj : (obj.words || [])
      for (const w of arr) {
        const word = String(w.word || w.term || '').trim()
        const def = String(w.definition || w.def || w.meaning || '').trim()
        const distractors = (w.distractors || w.options || []).map(String)
        if (word && def) words.push({ word, definition: def, distractors })
      }
    } catch(e){ console.warn('pack parse error', p) }
  }
  return words
}

function main(){
  const words = loadAll(PACKS)
  const items = words.map((w, i) => {
    const choices = [w.definition, ...w.distractors.slice(0,3)].filter(Boolean).slice(0,4)
    return {
      id: `good:${i+1}:${w.word}`,
      title: `The Good Word — ${w.word}`,
      input_type: 'mcq',
      prompt_html: `<p>Choose the best definition for <strong>${w.word}</strong>.</p>`,
      choices,
      correct_index: 0
    }
  })
  const bundle = { kind: 'good_word', version: 1, count: items.length, items }
  fs.writeFileSync(OUT, JSON.stringify(bundle,null,2), 'utf8')
  console.log('✅ Wrote', OUT)
}
main()

