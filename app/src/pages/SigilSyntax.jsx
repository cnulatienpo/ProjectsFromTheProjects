import { useEffect, useState } from 'react'
import { api, apiBase, safeFetchJSON } from '@/lib/apiBase'
import { useNavigate } from 'react-router-dom'
import { snapAndDownload } from '@/lib/snapshot.js'
import { toCatalogItems } from '@/lib/normalize'

export default function SigilSyntax(){
  const [raw, setRaw] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [debug, setDebug] = useState({ base: '', tried: '' })
  const nav = useNavigate()

  useEffect(() => {
    const base = apiBase || '(relative)'
    const url = api('/sigil/catalog')
    setDebug({ base, tried: url })
    let alive = true
    ;(async () => {
      try {
        setLoading(true)
        setError('')
        const json = await safeFetchJSON(url)
        if (alive) setRaw(json)
      } catch (e) {
        console.warn('Catalog load failed:', e?.message || e)
        if (alive) {
          setRaw(null)
          setError(e?.message ? String(e.message) : String(e))
        }
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => { alive = false }
  }, [])

  if (error) return (
    <main className="sigil-root surface" style={{padding:24}}>
      Catalog: <b>Error:</b> {error}
      <pre style={{marginTop:12, fontSize:12, opacity:.8}}>{`Base: ${debug.base}
URL:  ${debug.tried}`}</pre>
      <p style={{fontSize:12, opacity:.8}}>
        Try opening the URL above in a new tab. If it’s not JSON, the backend isn’t serving that path.
      </p>
    </main>
  )

  const items = toCatalogItems(raw)
  const count = items.length
  const firstId = raw?.first || (items[0]?.id ?? null)

  return (
    <main className="sigil-root surface" style={{padding:24, display:'grid', gap:16}}>
      <h1>Sigil &amp; Syntax</h1>
      <p>Catalog: Found {count} lessons</p>
      <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
        {!!firstId && (
          <button
            onClick={()=>nav(`/sigil/${encodeURIComponent(firstId)}`)}
            style={{padding:'10px 16px', border:'1px solid #000', background:'#fff', cursor:'pointer'}}
          >
            Start first lesson
          </button>
        )}
        <button
          onClick={()=>snapAndDownload('main', 'sigil-catalog.png')}
          style={{padding:'10px 16px', border:'1px solid #000', background:'#fff', cursor:'pointer'}}
        >
          Save screenshot
        </button>
      </div>
      <p><a href="/">Back home</a></p>

      {loading && (
        <div className="surface" style={{ padding: '1rem', margin: '1rem 0' }}>
          <strong>Loading…</strong>
        </div>
      )}

      {!loading && items.length === 0 && (
        <div className="surface" style={{ padding: '1rem', margin: '1rem 0' }}>
          <strong>No lessons yet.</strong>
          <div className="muted" style={{ fontSize: '.9rem' }}>Add items to /sigil/catalog and reload.</div>
        </div>
      )}

      {items.length > 0 && (
        <div className="grid" style={{ display: 'grid', gap: '12px', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
          {items.map((it, i) => {
            const title = it?.title ?? 'Untitled'
            const id = it?.id ?? `item-${i}`
            const type = it?.type ?? 'lesson'
            const level = it?.level ?? 1
            return (
              <article key={id} className="card" style={{ padding: '1rem' }}>
                <header style={{ marginBottom: '.5rem' }}>
                  <h3 style={{ margin: 0 }}>{title}</h3>
                  <div className="muted" style={{ fontSize: '.9rem' }}>
                    {type} • L{level}
                  </div>
                </header>
                <footer>
                  <button
                    className="btn btn-primary"
                    onClick={() => nav(`/sigil/${encodeURIComponent(id)}`)}
                  >
                    Play
                  </button>
                </footer>
              </article>
            )
          })}
        </div>
      )}
    </main>
  )
}
