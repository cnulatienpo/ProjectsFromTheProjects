import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import GameLayout from '@sigil/GameLayout'
import { api, safeFetchJSON } from '@/lib/apiBase.js'

export default function SigilSyntax() {
  const { id } = useParams()
  const nav = useNavigate()
  const [status, setStatus] = useState('Checking…')
  const [first, setFirst] = useState(null)

  useEffect(() => {
    safeFetchJSON(api('/sigil/catalog'))
      .then(j => {
        setStatus(`Found ${j?.games?.length ?? 0} lessons`)
        setFirst(j?.first || j?.games?.[0] || null)
      })
      .catch(e => setStatus(`Error: ${String(e.message || e)}`))
  }, [])

  return (
    <GameLayout title="Sigil_&_Syntax">
      <div style={{ padding: 12 }}>
        <p><strong>Catalog:</strong> {status}</p>
        {first && !id && (
          <p>
            <button onClick={() => nav(`/sigil/${encodeURIComponent(first)}`)}>
              Go to first lesson
            </button>
          </p>
        )}
        <p><Link to="/">Back home</Link></p>
      </div>
    </GameLayout>
  )
}
