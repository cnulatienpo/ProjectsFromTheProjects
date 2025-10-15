import { Link } from 'react-router-dom'

export default function GoodWordStub() {
  return (
    <main style={{ padding: 24 }}>
      <h2>The Good Word (stub)</h2>
      <p>This is a safe placeholder so the app boots.</p>
      <p>
        <Link to="/">Back home</Link>
      </p>
    </main>
  )
}
