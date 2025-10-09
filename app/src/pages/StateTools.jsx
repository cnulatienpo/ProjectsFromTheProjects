import { useState } from 'react'
import { exportState, importState } from '@/lib/stateIO.js'

export default function StateTools() {
    const [msg, setMsg] = useState('')
    function doExport() {
        const blob = new Blob([exportState()], { type: 'application/json' })
        const a = document.createElement('a')
        a.href = URL.createObjectURL(blob)
        a.download = `pfp-state-${Date.now()}.json`
        document.body.appendChild(a); a.click(); a.remove()
    }
    async function onImport(e) {
        const file = e.target.files?.[0]; if (!file) return
        const txt = await file.text()
        const ok = importState(txt)
        setMsg(ok ? '✅ Imported. Reload the page.' : '❌ Invalid file.')
    }
    return (
        <div className="game-intro">
            <div className="card" style={{ maxWidth: 700 }}>
                <h1>State Tools</h1>
                <p>Export or import your local progress/mastery (no server DB required).</p>
                <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                    <button className="btn" onClick={doExport}>Download state (.json)</button>
                    <label className="btn" style={{ cursor: 'pointer' }}>
                        Import state…
                        <input type="file" accept="application/json" onChange={onImport} style={{ display: 'none' }} />
                    </label>
                </div>
                <p style={{ marginTop: 10 }}>{msg}</p>
            </div>
        </div>
    )
}
