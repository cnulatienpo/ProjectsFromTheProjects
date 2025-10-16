import fs from 'fs'
import path from 'path'

const LAB = 'labeled data'
const TWEETS = path.join(LAB, 'tweetrunk_renumbered')
const OUT = path.resolve('game things','build','sigil-syntax')
fs.mkdirSync(OUT, { recursive: true })

function readJSONL(p){ const out=[]; if(!fs.existsSync(p)) return out
  for (const line of fs.readFileSync(p,'utf8').split('\n')) {
    const t=line.trim(); if(!t) continue; try{ out.push(JSON.parse(t)) }catch{}
  } return out
}
function listSorted(dir){
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir).filter(f=>/\.(json|jsonl)$/i.test(f))
    .map(f=>({ f, n: +(f.match(/^(\d+)/)?.[1] ?? 999999) }))
    .sort((a,b)=>a.n-b.n).map(x=>path.join(dir,x.f))
}
const seen = new Set()
function uniqId(base){ let i=0, out=base; while(seen.has(out)) out = `${base}#${++i}`; seen.add(out); return out }

function toItem(o, i){
  const id = uniqId(o.id || `w:${i+1}`)
  const prompt = o.prompt_html || o.prompt || o.text || ''
  return {
    id:`sigil:${id}`,
    title: o.title || `Sigil_&_Syntax — Lesson ${i+1}`,
    input_type: o.input_type || 'write',
    prompt_html: String(prompt),
    min_words: +(o.min_words ?? 30)
  }
}

;(function main(){
  const files = listSorted(TWEETS)
  if (files.length === 0) {
    console.error('❌ No lesson files found in', TWEETS)
    process.exit(1)
  }
  let items = []
  for (const p of files) {
    if (p.endsWith('.jsonl')) items.push(...readJSONL(p).map((o,i)=>toItem(o, items.length+i)))
    else {
      try {
        const raw = JSON.parse(fs.readFileSync(p,'utf8'))
        const arr = Array.isArray(raw) ? raw : (raw.items || raw.lessons || [raw])
        items.push(...arr.map((o,i)=>toItem(o, items.length+i)))
      } catch(e) { console.warn('⚠️ Could not parse', p, e.message) }
    }
  }
  const bundle = { kind:'sigil-syntax', version:1, first: items[0]?.id || null, items }
  fs.writeFileSync(path.join(OUT,'bundle_sigil_syntax.json'), JSON.stringify(bundle,null,2), 'utf8')
  console.log('✅ wrote', path.join(OUT,'bundle_sigil_syntax.json'), 'items=', items.length)
})()
