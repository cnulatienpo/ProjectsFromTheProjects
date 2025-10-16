import React, { useEffect, useState } from 'react'
import { safeFetchJSON } from '@/lib/apiBase'

export default function Progress({ user = 'local-user' }) {
    const [rows, setRows] = useState([])
    const [err, setErr] = useState('')

    useEffect(() => {
        const url = `/api/mastery?user_id=${encodeURIComponent(user)}`
        safeFetchJSON(url)
            .then(d => setRows(d.rows || []))
            .catch(e => setErr(e instanceof Error ? e.message : String(e)))
    }, [user])

    if (err) return <div style={{ color: 'tomato' }}>Progress error: {String(err)}</div>
    if (!rows.length) return <div style={{ opacity: 0.7 }}>No mastery data yet.</div>

    return (
        <div>
            <h3>Mastery</h3>
            <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                <thead>
                    <tr>
                        <th style={{ textAlign: 'left', padding: '6px 10px' }}>Skill</th>
                        <th style={{ textAlign: 'left', padding: '6px 10px' }}>Mastery</th>
                        <th style={{ textAlign: 'left', padding: '6px 10px' }}>Last Score</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map(r => (
                        <tr key={r.skill}>
                            <td style={{ padding: '6px 10px' }}>{r.skill}</td>
                            <td style={{ padding: '6px 10px' }}>{Number(r.mu ?? 0).toFixed(2)}</td>
                            <td style={{ padding: '6px 10px' }}>{Number(r.last_score ?? 0).toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
