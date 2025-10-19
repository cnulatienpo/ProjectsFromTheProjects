import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, safeFetchJSON } from '@/lib/apiBase.js'
import { fetchNextId } from '@/lib/progressApi.js' // ok if missing; guard below

export default function SigilSyntax(){
  const nav = useNavigate()
  const [cat, setCat] = useState({ games: [], first: null })
  const [nextId, setNextId] = useState(null)
  const [err, setErr] = useState('')

  useEffect(()=>{
    let mounted = true
    setErr('')
    safeFetchJSON(api('/sigil/catalog'))
      .then(async j=>{
        if (!mounted) return
        const games = Array.isArray(j?.games) ? j.games : []
        const first = j?.first || games[0] || null
        setCat({ games, first })
        try {
          if (typeof fetchNextId === 'function') {
            const id = await fetchNextId(games)
            if (mounted) setNextId(id)
          }
        } catch {}
      })
      .catch(e=>mounted && setErr(String(e)))
    return ()=>{ mounted = false }
  },[])

  const count = cat.games.length
  return (
    <main style={{padding:24, display:'grid', gap:16}}>
      <h1>Sigil &amp; Syntax</h1>
      <p>Catalog: Found {count} lessons</p>

      <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
        {cat.first && (
          <button
            onClick={()=>nav(`/sigil/${encodeURIComponent(cat.first)}`)}
            style={btn}
          >
            Start first lesson
          </button>
        )}
        {nextId && (
          <button
            onClick={()=>nav(`/sigil/${encodeURIComponent(nextId)}`)}
            style={btn}
            title="Continue where you left off"
          >
            Continue where I left off
          </button>
        )}
      </div>

      {err && <div style={{color:'#b54708'}}><b>Catalog:</b> Error: {err}</div>}
      <p><a href="/">Back home</a></p>
    </main>
  )
}
const btn = { padding:'10px 16px', border:'1px solid #000', background:'#fff', cursor:'pointer' }
