// app/src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import SigilSyntax from '@/pages/SigilSyntax.jsx'
import SigilRunner from '@/pages/SigilRunner.jsx'
import GameDemo from '@/pages/GameDemo.jsx'
import ApiTest from '@/pages/ApiTest.jsx'

function NotFound() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Not found</h1>
      <p><a href="/projects-from-the-projects/sigil">Go to Sigil &amp; Syntax</a></p>
      <p><a href="/projects-from-the-projects/game-demo">🎮 Try the NEW Game Demo (shows migrated features)</a></p>
    </main>
  )
}

export default function App() {
  // Use Vite’s BASE_URL so it works on GitHub Pages and in dev
  const base = import.meta.env.BASE_URL || '/'
  return (
    <BrowserRouter basename={base}>
      <Routes>
        {/* Home → send to Sigil catalog */}
        <Route path="/" element={<Navigate to="/sigil" replace />} />
        {/* API Test - debug connection issues */}
        <Route path="/api-test" element={<ApiTest />} />
        {/* NEW: Game Demo - shows all migrated features */}
        <Route path="/game-demo" element={<GameDemo />} />
        {/* Catalog */}
        <Route path="/sigil" element={<SigilSyntax />} />
        {/* Lesson runner */}
        <Route path="/sigil/:id" element={<SigilRunner />} />
        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}
