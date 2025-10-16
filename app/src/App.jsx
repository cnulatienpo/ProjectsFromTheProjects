import { Routes, Route } from 'react-router-dom'
import Home from '@/pages/Home.jsx'
import SigilSyntax from '@/pages/SigilSyntax.jsx'
import SigilRunner from '@/pages/SigilRunner.jsx'

export default function App(){
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/sigil" element={<SigilSyntax />} />
      <Route path="/sigil/:id" element={<SigilRunner />} />
    </Routes>
  )
}
