import { Link } from 'react-router-dom'
import '@/styles/links.css'

export default function Home() {
  return (
    <main style={{ minHeight: '100vh', padding: 24, background: '#bfe7ff' }}>
      <header style={{ borderBottom: '2px solid #000', paddingBottom: 12, marginBottom: 16 }}>
        <h1 style={{ margin: 0, fontWeight: 900, letterSpacing: 1 }}>Projects From The Projects</h1>
      </header>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ margin: '8px 0 12px' }}>Project #1: Literary Deviousness</h2>
        <p><strong>Fiction Writing School for Broke Mutherfuckers.</strong></p>
        <p>
          <Link className="link-white" to="/sigil">Play the game</Link>
        </p>
      </section>

      <section style={{ maxWidth: 800 }}>
        <p>Do you not know shit about writing or you suck at it? Me too. I made these games to learn grammar, character, narrative structure, and of course — the literary devices. You write, you read, you get feedback. It’s a lot like an interactive textbook on creative writing. If you know how to write already you will probably get bored. Thanks for playing.</p>
        <p><Link className="link-white" to="/sigil">Start →</Link></p>
      </section>
    </main>
  )
}
