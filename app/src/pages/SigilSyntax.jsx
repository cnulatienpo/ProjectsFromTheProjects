import { useEffect, useState } from 'react'
import '../../../src/pages/SigilSyntaxGame.css'
import { api, safeFetchJSON } from '@/lib/apiBase'
import { useNavigate } from 'react-router-dom'
import { fetchNextId } from '@/lib/progressApi.js'

export default function SigilSyntax(){
  const nav = useNavigate()
  const [cat, setCat] = useState({ games: [], first: null })
  const [err, setErr] = useState('')
  const [nextId, setNextId] = useState(null)

  useEffect(()=>{
    setErr('')
    safeFetchJSON(api('/sigil/catalog'))
      .then(async (j)=>{
        const games = Array.isArray(j?.games)
          ? j.games.map(it => typeof it === 'string' ? it : it?.id).filter(Boolean)
          : []
        const first = j?.first ? String(j.first) : (games[0] ?? null)
        setCat({ ...j, games, first })
        // ask backend what to resume; fallback to local if needed; validate against catalog
        try { setNextId(await fetchNextId(games)) } catch { setNextId(null) }
      })
      .catch(e=>setErr(String(e)))
  },[])

  if (err) return <main style={{padding:24}}><b>Catalog:</b> Error: {String(err)}</main>

  const count = cat.games?.length || 0

  return (
    <main style={{padding:24, display:'grid', gap:16}}>
      <h1>Sigil &amp; Syntax</h1>
      <p>Catalog: Found {count} lessons</p>
      <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
        {!!cat.first && (
          <button
            onClick={()=>nav(`/sigil/${encodeURIComponent(cat.first)}`)}
            style={{padding:'10px 16px', border:'1px solid #000', background:'#fff', cursor:'pointer'}}
          >
            Start first lesson
          </button>
        )}
        {!!nextId && (
          <button
            onClick={()=>nav(`/sigil/${encodeURIComponent(nextId)}`)}
            style={{padding:'10px 16px', border:'1px solid #000', background:'#fff', cursor:'pointer'}}
            title="Continue where you left off"
          >
            Continue where I left off
          </button>
        )}
      </div>
      <p><a href="/">Back home</a></p>
    </main>
  )
}
