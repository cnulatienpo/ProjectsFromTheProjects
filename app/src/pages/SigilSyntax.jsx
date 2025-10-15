import { useEffect, useState } from 'react'
import GameLayout from '@sigil/GameLayout'
import GameItem from '@sigil/GameItem'
import { useParams, useNavigate } from 'react-router-dom'
import { fetchSigilItem, firstSigilId } from '@/lib/gameAdapters/sources.js'

export default function SigilSyntax(){
  const { id } = useParams()
  const nav = useNavigate()
  const [spec, setSpec] = useState(null)
  const [err, setErr] = useState('')

  useEffect(() => {
    if (!id) firstSigilId().then(fid => { if (fid) nav(`/sigil/${encodeURIComponent(fid)}`, { replace:true }) })
  }, [id, nav])

  useEffect(() => {
    if (!id) return
    setSpec(null); setErr('')
    fetchSigilItem(id).then(setSpec).catch(e => setErr(String(e)))
  }, [id])

  return (
    <GameLayout title="Sigil_&_Syntax" feedback={err && <span style={{color:'tomato'}}>{err}</span>} onPrev={()=>nav(-1)}>
      {spec && <GameItem spec={spec} />}
    </GameLayout>
  )
}
