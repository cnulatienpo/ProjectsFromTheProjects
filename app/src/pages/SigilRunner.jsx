import { useEffect, useMemo, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { safeFetchJSON, api } from '@/lib/apiBase'
import NotesPanel from '@/components/NotesPanel.jsx'
import FeedbackTray from '@/components/FeedbackTray.jsx'
import BeatWritingBox from '@/components/BeatWritingBox.jsx'
import BeatRail from '@/components/BeatRail.jsx'
import { beatsForLesson } from '@/logic/beatUnlockSchedule'
import { useBeatUnlocks } from '@/state/useBeatUnlocks'
import { submitAttempt } from '@/lib/attemptApi.js'
import { markStarted, markSubmitted, markSkipped, fetchNextId } from '@/lib/progressApi.js'
import { snapAndDownload } from '@/lib/snapshot.js'
import { toCatalogItems } from '@/lib/normalize'
import { getLesson } from '@/services/sigilLesson'
import BeatTextEditor from '@/components/BeatTextEditor.jsx'

// Import the default emoticon mapping
const defaultBeatEmoticon = {
  action: "🔨",
  decision: "✅",
  desire: "❤️",
  conflict: "⚔️",
  obstacle: "🧱",
  climax: "⛰️",
  resolution: "🌅",
  reveal: "👁️",
  realization: "💡",
  exposition: "📜",
  foreshadow: "🌒",
  setup: "🎯",
  payoff: "🎉",
  emotion: "😭",
  suppression: "🤐",
  vulnerability: "🫀",
  power: "👑",
  shift: "🔄",
  intimacy: "🤝",
  alienation: "🪫",
  dialogue: "💬",
  nonverbal: "👀",
  interaction: "↔️",
  agreement: "✍️",
  disagreement: "❌",
  test: "🧪",
  reversal: "🔁",
  atmosphere: "🌫️",
  discovery: "🗺️",
  loss: "🕳️",
  arrival: "🚪",
  departure: "🛫",
  transition: "⏭️"
};

export default function SigilRunner() {
  console.log('[SIGIL RUNNER] mount id=', window.location.pathname)
  const { id } = useParams()
  const nav = useNavigate()
  const [lesson, setLesson] = useState(null)
  const [err, setErr] = useState('')
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [pendingInsert, setPendingInsert] = useState(null)

  // Function to handle beat insertion
  const handleBeatInsert = (beatData) => {
    console.log('Beat insert requested:', beatData);
    setPendingInsert(beatData);
  };

  const handleConsumePendingInsert = () => {
    setPendingInsert(null);
  };  // load lesson
  useEffect(() => {
    let active = true
    setErr('')
    setLesson(null)
    setLoading(true)
    const targetId = id ? String(id) : undefined
    getLesson(targetId)
      .then(data => {
        console.log('[SIGIL RUNNER] getLesson response for', targetId, data && typeof data === 'object' ? (data.id || '[has id]') : data)
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

  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  // mark started when lesson loads
  useEffect(() => {
    const lId = lesson?.id ?? (id ? String(id) : null)
    if (!lId) return
    try { markStarted?.(lId) } catch { }
  }, [lesson, id])

  // beat unlocks when lesson becomes available
  const { unlockBeats } = useBeatUnlocks()
  useEffect(() => {
    const lessonNumber = (() => { try { const m = String(lesson?.id || id || '').match(/(\d+)/); return m ? parseInt(m[1], 10) : NaN } catch { return NaN } })()
    if (!lesson || Number.isNaN(lessonNumber)) return
    const toUnlock = beatsForLesson(lessonNumber)
    console.log('[BEATS] unlocking', { lessonId: lesson?.id, lessonNumber, toUnlock })
    unlockBeats(lesson?.id || (`lesson-${lessonNumber}`), toUnlock, lesson?.emoticonColor)
  }, [lesson?.id, id])

  // real submit handler: post attempt, record submitted, then advance
  async function handleSubmit() {
    const lId = lesson?.id ?? (id ? String(id) : null)
    if (!lId) return alert('No lesson id')
    if (!text || text.trim().length === 0) return alert('Please write something first')
    setSubmitting(true)
    setSubmitError(null)
    try {
      const res = await submitAttempt({ id: lId, text, minWords: stats.min })
      // server returns { id, report }
      const verdict = res?.report?.verdict ?? null
      try { await markSubmitted?.(lId, verdict) } catch (e) { console.warn('markSubmitted failed', e) }
      // if the report contains memo lines, show them (optional)
      // advance to next lesson if desired
      const nextId = await fetchNextId()
      if (nextId) {
        nav(`/sigil/${encodeURIComponent(nextId)}`)
      } else {
        // fallback: use catalog
        await goNext()
      }
    } catch (err) {
      console.error('submit error', err)
      const msg = err?.message || String(err)
      setSubmitError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  // compute "next" id helper
  async function goNext() {
    function extractIds(cat) {
      if (!cat) return []
      // If the catalog itself is an array
      if (Array.isArray(cat)) {
        return cat.map(it => typeof it === 'string' ? it : (it?.id ?? it?.new_id ?? it?.original_id ?? ''))
          .filter(Boolean)
      }
      // arrays under common keys
      if (Array.isArray(cat.games)) return cat.games.map(g => typeof g === 'string' ? g : (g?.id ?? g))
      if (Array.isArray(cat.items)) return cat.items.map(i => i?.id ?? i)
      if (Array.isArray(cat.list)) return cat.list.map(i => i?.id ?? i)
      // fallback: try to pull ids from object values
      const arr = []
      for (const k of ['items', 'games', 'list']) {
        if (Array.isArray(cat[k])) {
          return cat[k].map(x => typeof x === 'string' ? x : (x?.id ?? x))
        }
      }
      return []
    }

    try {
      const cat = await safeFetchJSON(api('/sigil/catalog'))
      const idsRaw = extractIds(cat) || []
      const ids = idsRaw.map(String)

      // Prefer canonical lesson id when available
      const current = String(lesson?.id ?? lessonId ?? id ?? '')
      let idx = ids.indexOf(current)
      if (idx < 0) idx = Math.max(0, ids.indexOf(String(id)))
      if (idx < 0) idx = 0
      const next = ids[idx + 1] || ids[0]
      if (!next) return nav('/sigil')
      nav(`/sigil/${encodeURIComponent(next)}`)
    } catch (e) {
      // on error, fall back to catalog root
      console.warn('goNext error', e)
      nav('/sigil')
    }
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
        <div className="sigil-row" style={{ position: 'relative' }}>
          <BeatRail
            emoticonMap={lesson?.emoticonMap || defaultBeatEmoticon}
            colorMap={lesson?.emoticonColor}
            onInsert={handleBeatInsert}
          />
          <section className="sigil-editor">
            <BeatTextEditor
              value={text}
              onChange={setText}
              placeholder="Write your response here…"
              pendingInsert={pendingInsert}
              onConsumeInsert={handleConsumePendingInsert}
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
          <FeedbackTray
            text={text}
            minWords={stats.min}
            memo={rayLines}
            onSubmit={handleSubmit}
            onRetry={() => setText('')}
            onNext={goNext}
            onSkip={async () => {
              try { await markSkipped?.(id) } catch { }
              goNext()
            }}
            submitting={submitting}
            error={submitError}
          />
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
