import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, safeFetchJSON } from '@/lib/apiBase.js'

export default function SigilSyntax() {
  const nav = useNavigate()
  const [firstId, setFirstId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')

  useEffect(() => {
    let ok = true
    setLoading(true); setErr('')
    safeFetchJSON(api('/sigil/catalog'))
      .then(j => {
        if (!ok) return
        const tryArray = (arr) => {
          if (!Array.isArray(arr) || arr.length === 0) return null
          const f = arr[0]
          if (typeof f === 'string') return f
          return String(f?.id ?? f?.new_id ?? f?.original_id ?? '') || null
        }
        const firstFromItems = tryArray(j?.items) || tryArray(j?.games) || tryArray(j?.list) || tryArray(j)
        const first = j?.first ?? firstFromItems ?? null
        setFirstId(first)
      })
      .catch(e => ok && setErr(String(e)))
      .finally(() => ok && setLoading(false))
    return () => { ok = false }
  }, [])

  const start = () => {
    if (!firstId) return
    nav(`/sigil/${encodeURIComponent(firstId)}`)
  }

  return (
    <main style={shell}>
      <section style={card}>
        {/* Placeholder copy — replace with your own text later */}
        <div style={placeholderCopy}>
          {/* Write your landing text here. Keep it short; this is just a placeholder. */}
          <p style={{ margin: 0, opacity: 0.9 }}>
            {/* TODO: Replace this with your real intro text. */}
            This space is reserved for your intro copy to the Sigil &amp; Syntax game.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
          <button
            className="pfp-btn"
            onClick={start}
            disabled={!firstId || loading}
            style={{ ...btn, color: '#111' }}
            title={err ? `Error: ${err}` : (loading ? 'Loading…' : 'Start the first lesson')}
          >
            {loading ? 'Loading…' : 'Start'}
          </button>
        </div>

        {err && (
          <div style={{ marginTop: 12, color: '#b54708', fontSize: 13 }}>
            Could not load catalog: {err}
          </div>
        )}
      </section>
    </main>
  )
}

const shell = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 24,
  background: '#fff'
}
const card = {
  width: '100%',
  maxWidth: 720,
  border: '1px solid #000',
  padding: 24,
  background: '#fff'
}
const placeholderCopy = {
  minHeight: 120,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  fontSize: 18,
  lineHeight: 1.5,
  color: '#111'
}
const btn = {
  padding: '10px 20px',
  border: '1px solid #000',
  background: '#fff',
  cursor: 'pointer',
  fontSize: 16
}
