import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { api, safeFetchJSON } from '@/lib/apiBase.js'
import BeatPalette from '@/components/BeatPalette.jsx'
import NotesPanel from '@/components/NotesPanel.jsx'
import FeedbackTray from '@/components/FeedbackTray.jsx'
import { submitAttempt } from '@/lib/attemptApi.js'
import { markStarted, markSubmitted, markSkipped } from '@/lib/progressApi.js'
import { setLastSeen } from '@/lib/lastSeen.js'
import { snapAndDownload } from '@/lib/snapshot.js'

export default function SigilRunner(){
  const { id } = useParams()
  const nav = useNavigate()
  const [it, setIt] = useState(null)
  const [err, setErr] = useState('')
  const [text, setText] = useState('')
  const [rayMemo, setRayMemo] = useState(null)

  // load lesson
  useEffect(() => {
    setErr(''); setIt(null)
    safeFetchJSON(api(`/sigil/game/${encodeURIComponent(id)}`))
      .then(setIt)
      .catch(e=>setErr(String(e)))
  }, [id])

  // restore draft
  useEffect(() => {
    const key = `sigil:draft:${id}`
    const saved = localStorage.getItem(key)
    if (saved !== null) setText(saved)
  }, [id])

  // persist draft
  useEffect(() => {
    const key = `sigil:draft:${id}`
    localStorage.setItem(key, text)
  }, [id, text])

  // mark started + remember locally (must be before any early return)
  useEffect(() => {
    if (id && it) {
      try { markStarted?.(id) } catch {}
      try { setLastSeen?.(id) } catch {}
    }
  }, [id, it])

  const stats = useMemo(() => {
    const words = text.trim() ? text.trim().split(/\s+/).length : 0
    const min = it?.min_words ?? 30
    return { words, min }
  }, [text, it])

  if (err) {
    return (
      <main style={{padding:24}}>
        <b>Error:</b> {String(err)} <p><Link to="/sigil">Back to catalog</Link></p>
      </main>
    )
  }
  if (!it) return <main style={{padding:24}}>Loading lesson…</main>

  // Never show titles or game name — use content/prompt only
  const contentHTML = it.content_html || it.prompt_html || ''
  const promptHTML  = it.prompt_hint || (it.content_html && it.prompt_html ? it.prompt_html : '')

  // small default memo until first submit
  const memoFallback = [
    'Focus your character’s desire in the first 1–2 sentences.',
    'Add a concrete obstacle; make it specific.',
    'Use one sensory detail (sound, smell, texture).'
  ]
  const rayLines = (rayMemo && Array.isArray(rayMemo) && rayMemo.length) ? rayMemo : memoFallback

  // insert helper for BeatPalette
  const insertAtCursor = (snippet) => {
    const ta = document.querySelector('textarea[data-editor="sigil"]')
    const start = ta?.selectionStart ?? text.length
    const end   = ta?.selectionEnd ?? text.length
    const next  = text.slice(0, start) + snippet + text.slice(end)
    setText(next)
    requestAnimationFrame(() => {
      if (ta) { ta.focus(); const pos = start + snippet.length; ta.setSelectionRange(pos, pos) }
    })
  }

  async function handleSubmit(){
    try{
      const rsp = await submitAttempt({ id, text, minWords: stats.min })
      const rep = rsp?.report || null
      setRayMemo(rep?.memo || [])
      try { markSubmitted?.(id, rep?.verdict) } catch {}
      const tray = document.querySelector('.sigil-tray')
      tray?.scrollIntoView({ behavior:'smooth', block:'start' })
    }catch(e){
      alert('Could not submit: ' + e)
    }
  }

  return (
    <main className="pfp-shell">
      {/* Top toolbar — no game name, no titles */}
      <div className="pfp-toolbar">
        <button onClick={()=>snapAndDownload('main', `sigil-${encodeURIComponent(id)}.png`)} className="pfp-btn">Save screenshot</button>
        <button onClick={()=>nav('/sigil')} className="pfp-btn">Back to catalog</button>
      </div>

      {/* CONTENT (top) */}
      <section className="sigil-box sigil-content">
        <div dangerouslySetInnerHTML={{__html: contentHTML}} />
      </section>

      {/* PROMPT (smaller, same width, unlabeled) */}
      <section className="sigil-box sigil-prompt">
        <div dangerouslySetInnerHTML={{__html: promptHTML}} />
      </section>

      {/* 3-column: beats • editor • notes */}
      <div className="sigil-grid-3">
        <aside className="sigil-beats">
          <BeatPalette onInsert={insertAtCursor} compact vertical />
        </aside>

        <section className="sigil-editor">
          <textarea
            value={text}
            onChange={e=>setText(e.target.value)}
            data-editor="sigil"
            className="sigil-textarea"
            placeholder="Write your response here…"
          />
          <div className="sigil-meta">
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

      {/* Ray Ray Says + nav buttons */}
      <section className="sigil-tray">
        <div className="sigil-tray-title">Ray Ray Says</div>
        <FeedbackTray text={text} minWords={stats.min} />
        <div className="pfp-actions">
          <button className="pfp-btn" onClick={handleSubmit}>Submit</button>
          <button className="pfp-btn" onClick={()=>setText('')}>Try again</button>
          <button className="pfp-btn" onClick={()=>{
            safeFetchJSON(api('/sigil/catalog')).then(cat=>{
              const ids = cat.games || []
              const i = ids.indexOf(id)
              const next = ids[i+1] || ids[0]
              nav(`/sigil/${encodeURIComponent(next)}`)
            }).catch(()=>nav('/sigil'))
          }}>Next</button>
          <button className="pfp-btn" onClick={()=>{
            try { markSkipped?.(id) } catch {}
            safeFetchJSON(api('/sigil/catalog')).then(cat=>{
              const ids = cat.games || []
              const i = Math.max(0, ids.indexOf(id))
              const next = ids[i+1] || ids[0]
              nav(`/sigil/${encodeURIComponent(next)}`)
            }).catch(()=>nav('/sigil'))
          }}>I don’t feel like it</button>
        </div>
      </section>
    </main>
  )
}

