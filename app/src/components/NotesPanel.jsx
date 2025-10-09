import React, { useEffect, useMemo, useRef, useState } from 'react'
import './notes.css'

export default function NotesPanel({
  gameId = 'unknown',
  rayLines = [],          // array of strings from Ray Ray
  initialValue = '',      // starting user notes
  onChange = () => {},    // (value: string) -> void
  className = ''
}) {
  const [tab, setTab] = useState('you') // 'ray' | 'you'
  const [value, setValue] = useState('')
  const rayBoxRef = useRef(null)
  const youRef = useRef(null)

  // load/save local notes
  const storageKey = useMemo(() => `ld:notes:${gameId}`, [gameId])

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      setValue(saved ?? initialValue ?? '')
    } catch {
      setValue(initialValue ?? '')
    }
  }, [storageKey, initialValue])

  useEffect(() => {
    onChange(value)
    try { localStorage.setItem(storageKey, value) } catch {}
  }, [value, onChange, storageKey])

  function addFromRay(text) {
    if (!text) return
    const next = (value ? value.replace(/\s*$/, '\n') : '') + text + '\n'
    setValue(next)
    setTab('you')
    // focus at end
    setTimeout(() => {
      const el = youRef.current
      if (el) { el.focus(); el.selectionStart = el.selectionEnd = el.value.length }
    }, 0)
  }

  function selectedRayText() {
    const el = rayBoxRef.current
    if (!el) return ''
    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0) return ''
    const r = sel.getRangeAt(0)
    if (!el.contains(r.commonAncestorContainer)) return ''
    return String(sel).trim()
  }

  return (
    <aside className={`notes-wrap ${className}`} aria-label="Notes panel">
      <div className="notes-card">
        <div className="notes-tabs" role="tablist" aria-label="Notes tabs">
          <button role="tab" aria-selected={tab==='you'} className={tab==='you'?'on':''} onClick={()=>setTab('you')}>
            Your Notes
          </button>
          <button role="tab" aria-selected={tab==='ray'} className={tab==='ray'?'on':''} onClick={()=>setTab('ray')}>
            Ray Ray Says
          </button>
        </div>

        <div className="notes-body">
          {tab === 'you' ? (
            <div className="ruled-sheet" aria-label="Your notes">
              <textarea
                ref={youRef}
                className="ruled-input"
                value={value}
                onChange={e=>setValue(e.target.value)}
                spellCheck={true}
                aria-label="Notes text area"
                placeholder="Type your notes here…"
              />
            </div>
          ) : (
            <div className="ray-box" ref={rayBoxRef} aria-live="polite" aria-label="Ray Ray feedback">
              {rayLines && rayLines.length ? (
                <ul className="ray-list">
                  {rayLines.map((t,i)=> <li key={i}>{t}</li>)}
                </ul>
              ) : (
                <p className="ray-empty">No feedback yet.</p>
              )}

              <div className="notes-actions">
                <button
                  type="button"
                  className="btn"
                  onClick={() => addFromRay(selectedRayText() || rayLines.join('\n'))}
                  title="Add selected Ray Ray text to your notes"
                >
                  + Add from Ray Ray
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
