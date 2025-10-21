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
    <div className="notepad" data-debug="NotesPanel-EDITED-v2" style={{ position: 'relative' }}>
      <div style={{ position: 'absolute', top: '-15px', right: '0', fontSize: '10px', color: 'red', background: 'yellow', padding: '2px' }}>
        EDITED-v2
      </div>
      <div className="notepad__paper">
        <div className="notepad__section">
          <div className="notepad__heading">{rayRayTitle}:</div>
          <ul className="notepad__lines">
            {rr.length ? rr.map((l, i) => (
              <li key={i} className="notepad__line">{String(l)}</li>
            )) : null}
          </ul>
        </div>

        <hr className="notepad__rule" />

        <div className="notepad__section">
          <div className="notepad__heading">Your notes:</div>
          <textarea
            className="notepad__textarea"
            placeholder=""
            value={mine}
            onChange={(e) => setMine(e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}
