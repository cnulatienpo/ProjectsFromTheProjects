import { useEffect, useState } from 'react'
import { api, safeFetchJSON } from '@/lib/apiBase.js'
import { useNavigate } from 'react-router-dom'

export default function SigilSyntax(){
  const [cat, setCat] = useState(null)
  const [err, setErr] = useState('')
  const [debug, setDebug] = useState({ base: '', tried: '' })
  const nav = useNavigate()

  useEffect(() => {
    const base = api('')
    const url = api('/sigil/catalog')
    setDebug({ base, tried: url })
    safeFetchJSON(url).then(setCat).catch(e=>setErr(String(e)))
  }, [])

  if (err) return (
    <main style={{padding:24}}>
      Catalog: <b>Error:</b> {err}
      <pre style={{marginTop:12, fontSize:12, opacity:.8}}>{`Base: ${debug.base}
URL:  ${debug.tried}`}</pre>
      <p style={{fontSize:12, opacity:.8}}>
        Try opening the URL above in a new tab. If it’s not JSON, the backend isn’t serving that path.
      </p>
    </main>
  )
  if (!cat) return <main style={{padding:24}}>Catalog: loading…</main>

  const count = (cat.games||[]).length
  return (
    <main style={{padding:24, display:'grid', gap:16}}>
      <h1>Sigil &amp; Syntax</h1>
      <p>Catalog: Found {count} lessons</p>
      {!!cat.first && (
        <button
          onClick={()=>nav(`/sigil/${encodeURIComponent(cat.first)}`)}
          style={{padding:'10px 16px', border:'1px solid #000', background:'#fff', cursor:'pointer', width:'fit-content'}}
        >
          Start first lesson
        </button>
      )}
      <p><a href="/">Back home</a></p>
    </main>
  )
}
