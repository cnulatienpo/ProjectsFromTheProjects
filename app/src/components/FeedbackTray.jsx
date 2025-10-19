import React from 'react'

export default function FeedbackTray({ lesson = {}, text = '' }) {
    // minimal live checks — placeholder for richer analysis
    const checks = []
    if (!text || text.trim().length === 0) checks.push({ ok: false, msg: 'No content yet.' })
    if (text && text.trim().split(/\s+/).length < 20) checks.push({ ok: false, msg: 'Short draft — try expanding.' })
    if (checks.length === 0) checks.push({ ok: true, msg: 'Looks good so far.' })

    return (
        <section className="feedback-tray" style={{ border: '1px solid #ddd', padding: 8, background: '#fff' }}>
            {/* Intentionally no title here; page provides heading */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {checks.map((c, i) => (
                    <div key={i} style={{ color: c.ok ? 'green' : '#b33' }}>{c.msg}</div>
                ))}
            </div>
        </section>
    )
}
