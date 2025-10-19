import { useEffect, useMemo, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { safeFetchJSON, api } from '@/lib/apiBase'
import NotesPanel from '@/components/NotesPanel.jsx'
import FeedbackTray from '@/components/FeedbackTray.jsx'
import { snapAndDownload } from '@/lib/snapshot.js'
import { toCatalogItems } from '@/lib/normalize'
import { getLesson } from '@/services/sigilLesson'

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

  // helper to strip an auto-generated title from content HTML
  const stripAutoTitle = (html) => {
    if (!html) return ''
    // remove a leading H1/H2 or a single <p><strong>...</strong></p> “title” line
    const hTag = html.replace(/^\s*<h[12][^>]*>.*?<\/h[12]>\s*/is, '')
    const strongFirst = hTag.replace(/^\s*<p>\s*<strong>[^<]+<\/strong>\s*<\/p>\s*/is, '')
    return strongFirst
  }

  // minimal submit stub (preserve previous behavior until backend wiring is reintroduced)
  function handleSubmit() {
    alert('Submit stubbed (wire later)')
  }

  if (err) return <main className="sigil-root surface" style={{ padding: 24 }}><b>Error:</b> {err} <p><Link to="/sigil">Back to catalog</Link></p></main>
  if (!lesson) return <main className="sigil-root surface" style={{ padding: 24 }}>{loading ? 'Loading lesson…' : 'No lesson available.'}</main>

  // simple “Ray Ray Says” lines (placeholder; can be real analysis later)
  const rayLines = [
    'Focus your character’s desire in the first 1–2 sentences.',
    'Add a concrete obstacle; make it specific.',
    'Use one sensory detail (sound, smell, texture).'
  ]
  // Never show titles or game name — use content/prompt only
  const it = lesson
  const rawContent = it?.content_html || it?.prompt_html || ''
  const contentHTML = stripAutoTitle(rawContent)
  const promptHTML = it?.prompt_hint || (it?.content_html && it?.prompt_html ? it.prompt_html : '')

  return (
    <main className="pfp-shell">
      <div className="sigil-stage">
        {/* CONTENT (centered, grows with text) */}
        <section className="sigil-box sigil-content">
          <div dangerouslySetInnerHTML={{ __html: contentHTML }} />
        </section>

        {/* PROMPT (same width, unlabeled) */}
        <section className="sigil-box sigil-prompt">
          <div dangerouslySetInnerHTML={{ __html: promptHTML }} />
        </section>

        {/* Editor + Notes side-by-side (notes attached right) */}
        <div className="sigil-row">
          <section className="sigil-editor">
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              data-editor="sigil"
              className="sigil-textarea"
              placeholder="Write your response here…"
            />
            <div className="sigil-meta" style={{ padding: '8px 12px', borderTop: '1px solid #000' }}>
              {stats.words} words {stats.words < stats.min ? `(need at least ${stats.min})` : '✓'}
            </div>
          </section>

          <aside className="sigil-notes">
            <NotesPanel
              gameKey="sigil"
              lessonId={id}
              rayRayTitle="Ray Ray Says"
              rayRayLines={rayLines}
            />
          </aside>
        </div>

        {/* Ray Ray Says + navigation (full width, grows with content) */}
        <section className="sigil-tray">
          <div className="sigil-tray-title">ray ray says:</div>
          <FeedbackTray text={text} minWords={stats.min} />
          <div className="pfp-actions">
            <button className="pfp-btn" onClick={handleSubmit}>Submit</button>
            <button className="pfp-btn" onClick={() => setText('')}>Try again</button>
            <button className="pfp-btn" onClick={() => {
              safeFetchJSON(api('/sigil/catalog')).then(cat => {
                const ids = cat.games || []
                const i = ids.indexOf(id)
                const next = ids[i + 1] || ids[0]
                nav(`/sigil/${encodeURIComponent(next)}`)
              }).catch(() => nav('/sigil'))
            }}>Next</button>
            <button className="pfp-btn" onClick={() => {
              try { markSkipped?.(id) } catch { }
              safeFetchJSON(api('/sigil/catalog')).then(cat => {
                const ids = cat.games || []
                const i = Math.max(0, ids.indexOf(id))
                const next = ids[i + 1] || ids[0]
                nav(`/sigil/${encodeURIComponent(next)}`)
              }).catch(() => nav('/sigil'))
            }}>I don’t feel like it</button>
          </div>
        </section>
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
