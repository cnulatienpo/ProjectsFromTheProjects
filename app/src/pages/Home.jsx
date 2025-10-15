import { Link } from 'react-router-dom'

export default function Home(){
  return (
    <main style={{ minHeight:'100vh', padding:24, background:'#bfe7ff' }}>
      <h1 style={{ margin:0, fontWeight:900 }}>Projects From The Projects</h1>
      <p style={{ marginTop:8 }}><strong>Project #1: Literary Deviousness</strong></p>
      <p><Link to="/sigil">Go to Sigil_&_Syntax</Link></p>
      <p><Link to="/goodword/good:1:placeholder">Go to The Good Word</Link></p>
      <p style={{ opacity:.6, marginTop:24 }}>If this page shows, the app mounted correctly.</p>
    </main>
  )
}
