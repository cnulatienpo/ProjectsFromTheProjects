import { useEffect, useState } from 'react'

export default function MaintenanceBannerSmart() {
    const [msg, setMsg] = useState('')
    useEffect(() => {
        fetch('/status')
            .then(r => r.ok ? r.json() : Promise.reject())
            .then(data => setMsg(data.maintenance_msg || ''))
            .catch(() => setMsg(import.meta.env.VITE_MAINTENANCE_MSG || ''))
    }, [])
    if (!msg) return null
    return (
        <div style={{
            background: '#ffd',
            color: '#a00',
            padding: '0.5em 1em',
            textAlign: 'center',
            fontWeight: 600,
            borderBottom: '2px solid #a00'
        }}>
            {msg}
        </div>
    )
}
