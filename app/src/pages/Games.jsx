import { Link } from 'react-router-dom'
import '@/styles/links.css'

export default function Games() {
  const entries = [
    { to: '/sigil', label: 'Literary Deviousness' },
    { to: '/goodword/good:1:placeholder', label: 'The Good Word' }
  ]
  return (
    <main style={{ padding: 24, background: '#111', minHeight: '100vh' }}>
      <h1 style={{ marginTop: 0, color: '#fff', textShadow: '1px 1px 0 #000' }}>
        Literary Deviousness
      </h1>
      <div className="games-grid">
        {entries.map(e => (
          <div key={e.to} className="game-tile">
            <Link className="link-white" to={e.to}>{e.label}</Link>
          </div>
        ))}
      </div>
    </main>
  )
}
