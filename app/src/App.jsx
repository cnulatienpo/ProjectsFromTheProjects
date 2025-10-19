import { Routes, Route } from 'react-router-dom'
import Home from '@/pages/Home.jsx'
import SigilClassic from '@/pages/SigilClassic'
import Smoke from '@/pages/Smoke.tsx'

export default function App(){
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/_ui/smoke" element={<Smoke />} />
      <Route path="/sigil" element={<SigilClassic />} />
      <Route path="/sigil/:id" element={<SigilClassic />} />
    </Routes>
  )
}
