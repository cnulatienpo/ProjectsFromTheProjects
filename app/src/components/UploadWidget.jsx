import { useState } from 'react'
import { presignAndUpload } from '../lib/upload.js'
import { publicUrl } from '../lib/storage.js'

export default function UploadWidget() {
    const [msg, setMsg] = useState('')
    const [link, setLink] = useState('')

    async function onPick(e) {
        const file = e.target.files?.[0]
        if (!file) return
        setMsg('Signing…'); setLink('')
        try {
            const key = `assets/uploads/${Date.now()}-${file.name.replace(/\s+/g, '_')}`
            await presignAndUpload({ file, key, presignBase: 'http://localhost:8787' })
            const url = publicUrl(key)
            setMsg(`✅ Uploaded as ${key}`)
            setLink(url)
        } catch (err) {
            setMsg('❌ ' + err.message)
            setLink('')
        }
    }

    return (
        <div style={{ maxWidth: 900, margin: '0.75rem auto' }}>
            <label style={{ fontSize: '.9rem', fontWeight: 700, display: 'block', marginBottom: 6 }}>
                Attach asset (dev only)
            </label>
            <input type="file" onChange={onPick} />
            <div style={{ marginTop: 8, lineHeight: 1.6 }}>
                {msg}
                {link && (
                    <div>
                        <a href={link} target="_blank" rel="noreferrer">Open uploaded file</a>
                    </div>
                )}
            </div>
        </div>
    )
}
