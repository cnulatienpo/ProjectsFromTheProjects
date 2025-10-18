import { useEffect, useMemo, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { safeFetchJSON } from '@/lib/apiBase'
import NotesPanel from '@/components/NotesPanel.jsx'
import { snapAndDownload } from '@/lib/snapshot.js'
import { toCatalogItems } from '@/lib/normalize'
import { getLesson } from '@/services/sigilLesson'

export default function SigilRunner(){
  const { id } = useParams()
  const nav = useNavigate()
  const [lesson, setLesson] = useState(null)
  const [err, setErr] = useState('')
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)

  // load lesson
  useEffect(() => {
    let active = true
    setErr('')
    setLesson(null)
    setLoading(true)
    const targetId = id ? String(id) : undefined
    getLesson(targetId)
      .then(data => {
        if (!active) return
        if (!data) {
          setErr('Lesson unavailable.')
          return
        }
        setLesson(data)
      })
      .catch(e => {
        if (!active) return
        setErr(e?.message ? String(e.message) : String(e))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [id])

  // draft autosave keyed by lesson id
  useEffect(() => {
    const lessonId = lesson?.id ?? (id ? String(id) : null)
    if (!lessonId) return
    const key = `sigil:draft:${lessonId}`
    const saved = localStorage.getItem(key)
    if (saved !== null) {
      setText(saved)
    } else {
      setText('')
    }
  }, [lesson, id])
  useEffect(() => {
    const lessonId = lesson?.id ?? (id ? String(id) : null)
    if (!lessonId) return
    const key = `sigil:draft:${lessonId}`
    localStorage.setItem(key, text)
  }, [lesson, id, text])

  const stats = useMemo(() => {
    const words = text.trim() ? text.trim().split(/\s+/).length : 0
    const min = 30
    return { words, min }
  }, [text])

  const promptHtml = useMemo(() => lessonToHtml(lesson), [lesson])
  const lessonId = lesson?.id ?? (id ? String(id) : null)

  if (err) return <main className="sigil-root surface" style={{padding:24}}><b>Error:</b> {err} <p><Link to="/sigil">Back to catalog</Link></p></main>
  if (!lesson) return <main className="sigil-root surface" style={{padding:24}}>{loading ? 'Loading lesson…' : 'No lesson available.'}</main>

  // simple “Ray Ray Says” lines (placeholder; can be real analysis later)
  const rayLines = [
    'Focus your character’s desire in the first 1–2 sentences.',
    'Add a concrete obstacle; make it specific.',
    'Use one sensory detail (sound, smell, texture).'
  ]

  return (
    <main className="sigil-root surface" style={{padding:24}}>
      <div style={{display:'flex', gap:8, justifyContent:'flex-end', marginBottom:8}}>
        <button
          onClick={()=>snapAndDownload('main', `sigil-${encodeURIComponent(lessonId ?? 'lesson')}.png`)}
          style={{padding:'8px 12px', border:'1px solid #000', background:'#fff', cursor:'pointer', fontSize:12}}
        >
          Save screenshot
        </button>
      </div>
      <div style={{display:'grid', gridTemplateColumns:'2fr 1fr', gap:16, alignItems:'start'}}>
        {/* READ BOX */}
        <section style={{border:'1px solid #000', background:'#f6f6f6', padding:16}}>
          <h2 style={{marginTop:0}}>{lesson.title}</h2>
          <div dangerouslySetInnerHTML={{__html: promptHtml}} />
        </section>

        {/* NOTES (Ray Ray + My notes) */}
        <NotesPanel
          gameKey="sigil"
          lessonId={lessonId}
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
            safeFetchJSON('/sigil/catalog').then(cat=>{
              const items = toCatalogItems(cat)
              const ids = items.map(entry => entry.id)
              const current = lessonId ?? ''
              const idx = ids.indexOf(current)
              const nextIdx = idx >= 0 ? idx + 1 : 0
              const next = ids[nextIdx] ?? ids[0]
              if (next) nav(`/sigil/${encodeURIComponent(next)}`)
            })
          }}>Next</button>
          <button style={btn} onClick={()=>setText('')}>Try again</button>
        </div>
      </section>
    </main>
  )
}

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function toParagraphHtml(text = '') {
  const safe = escapeHtml(text)
  return safe
    .split(/\n\s*\n/)
    .map(block => `<p>${block.replace(/\n/g, '<br />')}</p>`)
    .join('')
}

function lessonToHtml(lesson) {
  if (!lesson) return ''
  const parts = []
  if (lesson.intro) parts.push(toParagraphHtml(lesson.intro))
  if (lesson.prompt) parts.push(toParagraphHtml(lesson.prompt))
  return parts.join('')
}

const btn = { padding:'10px 16px', border:'1px solid #000', background:'#fff', cursor:'pointer' }
