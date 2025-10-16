import React from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Home from '@/pages/Home.jsx'
import SigilSyntax from '@/pages/SigilSyntax.jsx'
import GoodWord from '@/pages/GoodWord.jsx'
import DebugAudit from '@/pages/DebugAudit.jsx'

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sigil" element={<SigilSyntax />} />
        <Route path="/sigil/:id" element={<SigilSyntax />} />
        <Route path="/debug/audit" element={<DebugAudit />} />
        <Route path="/goodword/:id" element={<GoodWord />} />
        <Route
          path="*"
          element={
            <div style={{ padding: 24 }}>
              Not found. <Link to="/">Home</Link>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
