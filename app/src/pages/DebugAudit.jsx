import { useEffect, useState } from 'react'
import { api, safeFetchJSON } from '@/lib/apiBase.js'
import { Link } from 'react-router-dom'

export default function DebugAudit(){
  const [d, setD] = useState(null)
  const [err, setErr] = useState('')
  useEffect(() => {
    safeFetchJSON(api('/__diag')).then(setD).catch(e => setErr(String(e)))
  }, [])
  if (err) return <main style={{padding:24}}><h2>Audit Error</h2><pre>{err}</pre></main>
  if (!d) return <main style={{padding:24}}>Running audit…</main>

  const Line = ({ok, name, extra}) => (
    <li style={{margin:'6px 0'}}>
      <span>{ok ? '✅' : '❌'} {name}</span>
      {extra ? <div style={{opacity:.7, fontSize:12}}>{extra}</div> : null}
    </li>
  )

  const f = d.frontend, c = d.content
  const checks = [
    [f.indexHtml.exists, 'app/index.html present'],
    [f.mainJsx.exists, 'app/src/main.jsx present'],
    [f.appJsx.exists, 'app/src/App.jsx present'],
    [f.sigilPage.exists, 'SigilSyntax.jsx present'],
    [f.apiBase.exists, 'apiBase present (dev/prod base URL)'],
    [f.viteCfg.exists, 'vite.config.js present', (f.viteNotes||[]).join(' • ')],
    [c.bundleInfo.exists || c.bundle.exists || c.bundleOld.exists, 'Sigil bundle exists'],
    [(c.bundleInfo.items||0) > 0, `Sigil bundle has lessons (${c.bundleInfo.items})`, 'Run emit:sigil:labeled if 0'],
  ]

  return (
    <main style={{ padding:24 }}>
      <h1>Audit</h1>
      <p>Backend base: {import.meta.env.DEV ? (import.meta.env.VITE_DEV_API || '(proxy)') : (import.meta.env.VITE_PROD_API || '(unset)')}</p>
      <ul>{checks.map(([ok,name,extra],i)=><Line key={i} ok={ok} name={name} extra={extra}/>)}</ul>
      <p><Link to="/">Home</Link></p>
    </main>
  )
}
