import { useEffect, useState } from 'react'
// ensure the Sigil UI stylesheet is loaded (shared source copy)
import '../../../src/pages/SigilSyntaxGame.css'
import { apiBase, safeFetchJSON } from '@/lib/apiBase'
import { useNavigate } from 'react-router-dom'
import { snapAndDownload } from '@/lib/snapshot.js'
import { toCatalogItems } from '@/lib/normalize'

export default function SigilSyntax() {
  const [intro, setIntro] = useState('')
  const nav = useNavigate()

  return (
    <main className="sigil-root surface" style={{ padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ maxWidth: 720, width: '100%', textAlign: 'center' }}>
        <h1 style={{ marginTop: 0 }}>Sigil &amp; Syntax</h1>
        <p style={{ marginTop: 8, marginBottom: 8 }}>Write the short intro or instructions for the lesson below. This text is a placeholder for now.</p>
        <textarea
          value={intro}
          onChange={e => setIntro(e.target.value)}
          placeholder="Write your intro/instructions here..."
          style={{ width: '100%', minHeight: 140, padding: 12, border: '1px solid #000', background: '#fff', color: '#000' }}
        />

        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center', gap: 12 }}>
          <button
            onClick={() => nav('/sigil/1')}
            style={{ padding: '10px 18px', border: '1px solid #000', background: '#000', color: '#fff', cursor: 'pointer' }}
          >
            Start
          </button>
        </div>
      </div>
    </main>
  )
}
