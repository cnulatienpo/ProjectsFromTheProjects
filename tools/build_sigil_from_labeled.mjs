import fs from 'fs'
import path from 'path'

const LD = 'labeled data'
const PRIMARY_JSONL = path.join(LD, 'tweetrunk_renumbered.jsonl')   // <-- your real file
const FALLBACK_DIRS = [
  path.join(LD, 'tweetrunk renumbered'),
  path.join(LD, 'tweetrunk_renumbered'),
  path.join(LD, 'tweetrunk-renumbered'),
  path.join(LD, 'sigil-lessons'),
  LD // scan LD as a last resort
]

const OUT = path.resolve('game things','build','sigil-syntax')
fs.mkdirSync(OUT, { recursive: true })

function readJSONL(p){
  const out=[]; if(!fs.existsSync(p)) return out
  const txt = fs.readFileSync(p,'utf8')
  for (const line of txt.split('\n')) {
    const t=line.trim(); if(!t) continue
    try { out.push(JSON.parse(t)) } catch(e){ /* skip bad line */ }
  }
  return out
}

function listAllLessonFiles(dir){
  const files=[]
  const walk=d=>{
    if(!fs.existsSync(d)) return
    for(const name of fs.readdirSync(d)){
      const p=path.join(d,name); const st=fs.statSync(p)
      if(st.isDirectory()) walk(p)
      else if(/\.(json|jsonl)$/i.test(name)) files.push(p)
    }
  }
  walk(dir)
  return files
    // ignore Good Word packs
    .filter(f=>!/the-good-word-pack|the-good-word-core/i.test(f))
    .map(f=>({ f, n:+(path.basename(f).match(/^(\d+)/)?.[1] ?? 999999) }))
    .sort((a,b)=>a.n-b.n)
    .map(x=>x.f)
}

const seen = new Set()
function uniqId(base){ let i=0, out=base; while(seen.has(out)) out=`${base}#${++i}`; seen.add(out); return out }

function toItem(o, i){
  const id = uniqId(o.id || `w:${i+1}`)
  const prompt = o.prompt_html || o.prompt || o.text || ''
  return {
    id:`sigil:${id}`,
    title:o.title || `Sigil_&_Syntax — Lesson ${i+1}`,
    input_type:o.input_type || 'write',
    prompt_html:String(prompt || 'Write 80–120 words about a character who wants something but faces a specific obstacle.'),
    min_words:+(o.min_words ?? 30)
  }
}

;(function main(){
  let items=[]
  if (fs.existsSync(PRIMARY_JSONL)) {
    console.log('🔎 Using primary file:', PRIMARY_JSONL)
    items = readJSONL(PRIMARY_JSONL).map((o,i)=>toItem(o,i))
  } else {
    // scan fallbacks
    const srcDir = FALLBACK_DIRS.find(d=>fs.existsSync(d)) || FALLBACK_DIRS[0]
    const files = listAllLessonFiles(srcDir)
    console.log('🔎 Scanning dir:', srcDir, 'files=', files.length)
    for(const p of files){
      if (p.toLowerCase().endsWith('.jsonl')) {
        items.push(...readJSONL(p).map((o,i)=>toItem(o, items.length+i)))
      } else {
        try{
          const raw = JSON.parse(fs.readFileSync(p,'utf8'))
          const arr = Array.isArray(raw) ? raw : (raw.items || raw.lessons || [raw])
          items.push(...arr.map((o,i)=>toItem(o, items.length+i)))
        }catch(e){ console.warn('⚠️ parse failed', p, e.message) }
      }
    }
  }

  if(items.length===0){
    console.warn('⚠️ No lessons parsed → emitting a sample so the app can run.')
    items.push(toItem({
      id:'sample-001',
      title:'Sample: Desire vs. Obstacle',
      input_type:'write',
      prompt_html:'<p>Write 80–120 words where a character wants something badly but faces a specific obstacle. Use sensory detail.</p>',
      min_words:80
    },0))
  }

  const outFile = path.join(OUT,'bundle_sigil_syntax.json')
  fs.writeFileSync(outFile, JSON.stringify({ kind:'sigil-syntax', version:1, first:items[0]?.id||null, items }, null, 2))
  console.log('✅ wrote', outFile, 'items=', items.length)
})()
