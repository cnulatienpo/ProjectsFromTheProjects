import { useEffect, useMemo, useState } from 'react'
// ensure the Sigil UI stylesheet is loaded (shared source copy)
import '../../../src/pages/SigilSyntaxGame.css'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { safeFetchJSON } from '@/lib/apiBase'
import NotesPanel from '@/components/NotesPanel.jsx'
import { snapAndDownload } from '@/lib/snapshot.js'
import { toCatalogItems } from '@/lib/normalize'
import { getLesson } from '@/services/sigilLesson'
import BeatPalette from '@/components/BeatPalette.jsx'
import FeedbackTray from '@/components/FeedbackTray.jsx'
import { submitAttempt } from '@/lib/attemptApi.js'

export default function SigilRunner() {
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

  // “Ray Ray Says” — live from backend once you submit
  const [rayMemo, setRayMemo] = useState(null)
  const rayLines = rayMemo && Array.isArray(rayMemo) && rayMemo.length
    ? rayMemo
    : [
      'Focus your character’s desire in the first 1–2 sentences.',
      'Add a concrete obstacle; make it specific.',
      'Use one sensory detail (sound, smell, texture).'
    ]

  async function handleSubmit() {
    try {
      const rsp = await submitAttempt({ id, text, minWords: stats.min })
      setRayMemo(rsp?.report?.memo || [])
      const tray = document.querySelector('.sigil-tray')
      tray?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } catch (e) {
      // keep simple for now
      alert('Could not submit: ' + (e?.message || String(e)))
    }
  }

  if (err) return <main className="sigil-root surface" style={{ padding: 24 }}><b>Error:</b> {err} <p><Link to="/sigil">Back to catalog</Link></p></main>
  if (!lesson) return <main className="sigil-root surface" style={{ padding: 24 }}>{loading ? 'Loading lesson…' : 'No lesson available.'}</main>

  return (
    <main className="sigil-root surface sigil-layout" style={{ padding: 24 }}>
      <div className="sigil-topbar" style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginBottom: 8 }}>
        <button
          onClick={() => snapAndDownload('main', `sigil-${encodeURIComponent(lessonId ?? 'lesson')}.png`)}
          style={{ padding: '8px 12px', border: '1px solid #000', background: '#fff', cursor: 'pointer', fontSize: 12 }}
        >
          Save screenshot
        </button>
      </div>

      {/* Content then prompt stacked */}
      <div className="sigil-top-boxes" style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 12 }}>
        <section className="sigil-content-box" style={{ border: '1px solid #000', padding: 12, background: '#f6f6f6' }}>
          <h2 style={{ marginTop: 0 }}>{lesson.title}</h2>
          <div dangerouslySetInnerHTML={{ __html: promptHtml }} />
        </section>
        <section className="sigil-prompt-box" style={{ border: '1px solid #000', padding: 12, background: '#fff' }}>
          <h3 style={{ marginTop: 0 }}>Prompt</h3>
          <div dangerouslySetInnerHTML={{ __html: promptHtml }} />
        </section>
      </div>

      {/* three-column layout: BEATS | EDITOR | NOTES */}
      <div className="sigil-grid" style={{ display: 'grid', gridTemplateColumns: '240px 1fr 360px', gap: 16, alignItems: 'start' }}>
        {/* BEATS */}
        <aside style={{ border: '1px solid #000', padding: 12, background: '#fff' }}>
          <h4 style={{ marginTop: 0 }}>Beats</h4>
          <BeatPalette vertical compact onInsert={chunk => {
            // insert chunk into the current cursor position (simple append for now)
            setText(prev => prev + (prev ? '\n\n' : '') + chunk)
          }} />
        </aside>

        {/* EDITOR */}
        <section style={{ border: '1px solid #000', padding: 12, background: '#fff' }}>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            style={{ width: '100%', height: '60vh', padding: 12, border: '1px solid #000', background: '#fff' }}
            placeholder="Write your response here…"
          />

          <div style={{ marginTop: 8, fontSize: 12, opacity: .85, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>{stats.words} words {stats.words < stats.min ? `(need at least ${stats.min})` : '✓'}</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={btn} onClick={handleSubmit}>Submit</button>
              <button style={btn} onClick={() => nav('/sigil')}>I don’t feel like it</button>
              <button style={btn} onClick={() => {
                safeFetchJSON('/sigil/catalog').then(cat => {
                  const items = toCatalogItems(cat)
                  const ids = items.map(entry => entry.id)
                  const current = lessonId ?? ''
                  const idx = ids.indexOf(current)
                  const nextIdx = idx >= 0 ? idx + 1 : 0
                  const next = ids[nextIdx] ?? ids[0]
                  if (next) nav(`/sigil/${encodeURIComponent(next)}`)
                })
              }}>Next</button>
              <button style={btn} onClick={() => setText('')}>Try again</button>
            </div>
          </div>

          {/* Feedback tray below editor */}
          <div style={{ marginTop: 12 }} className="sigil-tray">
            <FeedbackTray lesson={lesson} text={text} />
          </div>
        </section>

        {/* NOTES (Ray Ray + My notes) */}
        <NotesPanel
          gameKey="sigil"
          lessonId={lessonId}
          rayRayTitle="Ray Ray Says"
          rayRayLines={rayLines}
        />
      </div>
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

const btn = { padding: '10px 16px', border: '1px solid #000', background: '#fff', cursor: 'pointer' }
