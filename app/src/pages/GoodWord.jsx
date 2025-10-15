import { useEffect, useState } from 'react'
import GameLayout from '@sigil/GameLayout'
import GameItem from '@sigil/GameItem'
import { useParams, useNavigate } from 'react-router-dom'
import { fetchGoodItem } from '@/lib/gameAdapters/sources.js'

export default function GoodWord(){
  const { id } = useParams()
  const nav = useNavigate()
  const [spec, setSpec] = useState(null)
  const [err, setErr] = useState('')

  useEffect(() => {
    setSpec(null); setErr('')
    fetchGoodItem(id).then(setSpec).catch(e => setErr(String(e)))
  }, [id])

  return (
    <GameLayout title="The Good Word" feedback={err && <span style={{color:'tomato'}}>{err}</span>} onPrev={()=>nav(-1)}>
      {spec && <GameItem spec={spec} />}
    </GameLayout>
  )
}
