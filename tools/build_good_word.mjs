import fs from 'fs'
import path from 'path'

const ROOTS = ['game thingss', 'game things']
const BASE = (() => {
  for (const root of ROOTS) {
    if (fs.existsSync(path.resolve(root, 'the-good-word-core-AZ.json'))) return root
  }
  return ROOTS.find(d => fs.existsSync(d)) || 'game thingss'
})()
const OUTDIR = path.resolve(BASE, 'build')
fs.mkdirSync(OUTDIR, { recursive: true })

const PACKS = [
  'the-good-word-core-AZ.json',
  'the-good-word-pack-02-C-D.json',
  'the-good-word-pack-03-uncommon-E-F.json',
  'the-good-word-pack-04-uncommon-G-H.json',
  'the-good-word-pack-05-uncommon-I-J.json',
  'the-good-word-pack-06-uncommon-K-L.json',
  'the-good-word-pack-07-uncommon-M-N.json',
  'the-good-word-pack-08-uncommon-O-P.json',
  'the-good-word-pack-09-uncommon-Q-R.json',
  'the-good-word-pack-10-uncommon-S-T.json',
  'the-good-word-pack-11-uncommon-U-Z.json'
].map(f => path.resolve(BASE, f))
const OUT = path.join(OUTDIR, 'bundle_good_word.json')

function loadAll(){
  const words = []
  for (const p of PACKS) {
    if (!fs.existsSync(p)) { console.warn('missing pack', p); continue }
    try {
      const obj = JSON.parse(fs.readFileSync(p,'utf8'))
      // expect obj.words or array of {word, definition, distractors?[]}
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
  const words = loadAll()
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
