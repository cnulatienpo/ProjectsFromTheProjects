import { useEffect, useMemo, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { api, safeFetchJSON } from '@/lib/apiBase.js'
import NotesPanel from '@/components/NotesPanel.jsx'

export default function SigilRunner(){
  const { id } = useParams()
  const nav = useNavigate()
  const [it, setIt] = useState(null)
  const [err, setErr] = useState('')
  const [text, setText] = useState('')

  // load lesson
  useEffect(() => {
    setErr(''); setIt(null)
    safeFetchJSON(api(`/sigil/game/${encodeURIComponent(id)}`))
      .then(setIt)
      .catch(e=>setErr(String(e)))
  }, [id])

  // draft autosave keyed by lesson id
  useEffect(() => {
    const key = `sigil:draft:${id}`
    const saved = localStorage.getItem(key)
    if (saved !== null) setText(saved)
  }, [id])
  useEffect(() => {
    const key = `sigil:draft:${id}`
    localStorage.setItem(key, text)
  }, [id, text])

  const stats = useMemo(() => {
    const words = text.trim() ? text.trim().split(/\s+/).length : 0
    const min = it?.min_words ?? 30
    return { words, min }
  }, [text, it])

  if (err) return <main style={{padding:24}}><b>Error:</b> {err} <p><Link to="/sigil">Back to catalog</Link></p></main>
  if (!it) return <main style={{padding:24}}>Loading lesson…</main>

  // simple “Ray Ray Says” lines (placeholder; can be real analysis later)
  const rayLines = [
    'Focus your character’s desire in the first 1–2 sentences.',
    'Add a concrete obstacle; make it specific.',
    'Use one sensory detail (sound, smell, texture).'
  ]

  return (
    <main style={{padding:24}}>
      <div style={{display:'grid', gridTemplateColumns:'2fr 1fr', gap:16, alignItems:'start'}}>
        {/* READ BOX */}
        <section style={{border:'1px solid #000', background:'#f6f6f6', padding:16}}>
          <h2 style={{marginTop:0}}>{it.title}</h2>
          <div dangerouslySetInnerHTML={{__html: it.prompt_html}} />
        </section>

        {/* NOTES (Ray Ray + My notes) */}
        <NotesPanel
          gameKey="sigil"
          lessonId={id}
          rayRayTitle="Ray Ray Says"
          rayRayLines={rayLines}
        />
      </div>

      {/* BIG WRITER BOX */}
      <section style={{marginTop:16}}>
        <textarea
          value={text}
          onChange={e=>setText(e.target.value)}
          style={{width:'100%', height:'60vh', padding:16, border:'1px solid #000', background:'#fff'}}
          placeholder="Write your response here…"
        />
        <div style={{marginTop:8, fontSize:12, opacity:.75}}>
          {stats.words} words {stats.words < stats.min ? `(need at least ${stats.min})` : '✓'}
        </div>
        <div style={{marginTop:12, display:'flex', gap:8, flexWrap:'wrap'}}>
          <button style={btn} onClick={()=>alert('Submit stubbed (wire later)')}>Submit</button>
          <button style={btn} onClick={()=>nav('/sigil')}>Skip</button>
          <button style={btn} onClick={()=>{
            // simplistic “next”: go to next id in catalog
            safeFetchJSON(api('/sigil/catalog')).then(cat=>{
              const ids = cat.games || []
              const i = ids.indexOf(id)
              const next = ids[i+1] || ids[0]
              nav(`/sigil/${encodeURIComponent(next)}`)
            })
          }}>Next</button>
          <button style={btn} onClick={()=>setText('')}>Try again</button>
        </div>
      </section>
    </main>
  )
}

const btn = { padding:'10px 16px', border:'1px solid #000', background:'#fff', cursor:'pointer' }
