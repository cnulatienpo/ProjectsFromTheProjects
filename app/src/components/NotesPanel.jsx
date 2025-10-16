import { useEffect, useState } from 'react'

export default function NotesPanel({ gameKey='sigil', lessonId, rayRayTitle='Ray Ray Says', rayRayLines=[] }){
  const storageKey = `${gameKey}:notes:${lessonId}`
  const [tab, setTab] = useState('ray')
  const [myNotes, setMyNotes] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem(storageKey)
    if (saved !== null) setMyNotes(saved)
  }, [storageKey])
  useEffect(() => {
    localStorage.setItem(storageKey, myNotes)
  }, [storageKey, myNotes])

  return (
    <aside style={paper}>
      <div style={{display:'flex', gap:8, marginBottom:8}}>
        <button onClick={()=>setTab('ray')} style={tabBtn(tab==='ray')}>Ray Ray</button>
        <button onClick={()=>setTab('mine')} style={tabBtn(tab==='mine')}>My notes</button>
      </div>
      {tab==='ray' ? (
        <div>
          <div style={{fontSize:12, opacity:.7, marginBottom:6}}>{rayRayTitle}:</div>
          <ul style={{margin:0, paddingLeft:18}}>
            {rayRayLines.map((s,i)=><li key={i} style={{marginBottom:6}}>{s}</li>)}
          </ul>
        </div>
      ) : (
        <textarea
          value={myNotes}
          onChange={e=>setMyNotes(e.target.value)}
          style={{width:'100%', height:'45vh', border:'none', background:'transparent', lineHeight:'1.4'}}
          placeholder="Jot your notes here…"
        />
      )}
    </aside>
  )
}

const paper = {
  border:'1px solid #caa74a',
  background:'#fff8c6',
  padding:'12px 14px',
  boxShadow:'0 2px 6px rgba(0,0,0,.12)',
  backgroundImage:`linear-gradient(#bfe1ff 1px, transparent 1px)`,
  backgroundSize:'100% 24px'
}
const tabBtn = (active)=>(
  {
    padding:'6px 10px',
    border:'1px solid #000',
    background: active ? '#fff' : '#f1f1f1',
    cursor:'pointer',
    fontSize:12
  }
)
