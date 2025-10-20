import { useEffect, useMemo, useState } from 'react'

/**
 * One unified notepad:
 * - Top: "Ray Ray Says" lines (read-only)
 * - Divider
 * - Bottom: "Your notes" textarea (saved per lesson)
 */
export default function NotesPanel({ gameKey = 'sigil', lessonId, rayRayTitle = 'Ray Ray Says', rayRayLines = [] }) {
  const storeKey = `${gameKey}:notes:${lessonId || 'unknown'}`
  const [mine, setMine] = useState('')

  // load my notes
  useEffect(() => {
    try {
      const v = localStorage.getItem(storeKey)
      if (v != null) setMine(v)
    } catch { }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeKey])

  // save on change
  useEffect(() => {
    try { localStorage.setItem(storeKey, mine) } catch { }
  }, [storeKey, mine])

  const rr = useMemo(() => Array.isArray(rayRayLines) ? rayRayLines : [], [rayRayLines])

  return (
    <div className="notepad">
      <div className="notepad__paper">
        <div className="notepad__section">
          <div className="notepad__heading">{rayRayTitle}:</div>
          <ul className="notepad__lines">
            {rr.length ? rr.map((l, i) => (
              <li key={i} className="notepad__line">{String(l)}</li>
            )) : (
              <>
                <li className="notepad__line">• Focus your character’s desire in the first 1–2 sentences.</li>
                <li className="notepad__line">• Add one concrete obstacle.</li>
                <li className="notepad__line">• Include a sensory detail (sound/smell/texture).</li>
              </>
            )}
          </ul>
        </div>

        <hr className="notepad__rule" />

        <div className="notepad__section">
          <div className="notepad__heading">Your notes:</div>
          <textarea
            className="notepad__textarea"
            placeholder="Jot your plan, beats, or reminders…"
            value={mine}
            onChange={(e) => setMine(e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}
