import { useState } from 'react'
import { presignAndUpload } from '../lib/upload.js'

export default function UploadTest() {
    const [msg, setMsg] = useState('')

    async function handle(e) {
        const file = e.target.files?.[0]
        if (!file) return
        setMsg('Signing…')
        try {
            const key = `assets/uploads/${Date.now()}-${file.name.replace(/\s+/g, '_')}`
            await presignAndUpload({ file, key, presignBase: 'http://localhost:8787' })
            setMsg(`✅ Uploaded as ${key}`)
        } catch (err) {
            setMsg('❌ ' + err.message)
        }
    }

    return (
        <div className="game-intro">
            <div className="card">
                <h1>Upload Test</h1>
                <input type="file" onChange={handle} />
                <p style={{ marginTop: '1rem' }}>{msg}</p>
            </div>
        </div>
    )
}
