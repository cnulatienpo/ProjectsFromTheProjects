import { useEffect, useState } from 'react'
import '../../../src/pages/SigilSyntaxGame.css'
import { api, safeFetchJSON } from '@/lib/apiBase'
import { useNavigate } from 'react-router-dom'
import { fetchNextId } from '@/lib/progressApi.js'

export default function SigilSyntax(){
  const nav = useNavigate()
  const [cat, setCat] = useState({ items: [], first: null })
  const [err, setErr] = useState('')
  const [nextId, setNextId] = useState(null)

  useEffect(()=>{
    setErr('')
    safeFetchJSON(api('/sigil/catalog'))
      .then((j)=>{
        const items = Array.isArray(j?.items) ? j.items : []
        const first = j?.first ? String(j.first) : (items[0]?.id ?? null)
        setCat({ items, first })
        // ask backend what to resume; no counts shown
        fetchNextId().then(setNextId).catch(()=>setNextId(null))
      })
      .catch(e=>setErr(String(e)))
  },[])

  if (err) return <main style={{padding:24}}><b>Catalog:</b> Error: {String(err)}</main>

  const count = cat.items?.length || 0

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
