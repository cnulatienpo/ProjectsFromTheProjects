import { useEffect, useState } from 'react'
import GameLayout from '@sigil/GameLayout'
import GameItem from '@sigil/GameItem'
import { fetchCutItem } from '@/lib/gameAdapters/cutGood.js'
import { useParams, useNavigate } from 'react-router-dom'

export default function CutGame() {
  const { id } = useParams()
  const nav = useNavigate()
  const [spec, setSpec] = useState(null)
  const [err, setErr] = useState('')

  useEffect(() => {
    setSpec(null); setErr('')
    fetchCutItem(id).then(setSpec).catch(e => setErr(String(e)))
  }, [id])

  return (
    <GameLayout title="Cut Game" feedback={err && <span style={{color:'tomato'}}>{err}</span>} onPrev={()=>nav(-1)}>
      {spec && <GameItem spec={spec} onResult={() => {}} />}
    </GameLayout>
  )
}
