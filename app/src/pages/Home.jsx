import { Link } from 'react-router-dom'
import '@/styles/links.css'

export default function Home() {
  return (
    <main style={{ padding: 24 }}>
      {/* your existing header/skyline goes here */}
      <p>
        <Link className="link-white" to="/sigil">
          Literary Deviousness
        </Link>
      </p>
    </main>
  )
}
