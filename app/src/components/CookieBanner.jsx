import { useEffect, useState } from 'react'

const KEY = 'pfp:cookie-consent' // localStorage; no cookies until accepted

export default function CookieBanner() {
    const [open, setOpen] = useState(false)
    const [text, setText] = useState('')

    useEffect(() => {
        // already accepted?
        try { if (localStorage.getItem(KEY) === 'yes') return }
        catch { } // ignore
        // load banner text
        fetch(`${import.meta.env.BASE_URL || '/'}legal/cookie.txt`)
            .then(r => r.ok ? r.text() : '')
            .then(t => { setText(t || 'This site uses local storage for essential features.'); setOpen(true) })
            .catch(() => { setText('This site uses local storage for essential features.'); setOpen(true) })
    }, [])

    function accept() {
        try { localStorage.setItem(KEY, 'yes') } catch { }
        setOpen(false)
        // place to enable optional analytics later (gtag, etc.)
        // if (window.enableAnalytics) window.enableAnalytics()
    }

    function decline() {
        try { localStorage.setItem(KEY, 'no') } catch { }
        setOpen(false)
    }

    if (!open) return null

    return (
        <div role="dialog" aria-live="polite" aria-label="Cookie notice"
            style={{
                position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 9999,
                background: '#111', color: '#fff', borderTop: '4px solid #000'
            }}>
            <div style={{ maxWidth: 900, margin: '0 auto', padding: '12px 16px' }}>
                <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.5, marginBottom: 8 }}>{text}</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button className="btn primary" onClick={accept} aria-label="Accept cookies and continue">Accept</button>
                    <button className="btn" onClick={decline} aria-label="Decline optional cookies">Decline</button>
                    <a className="start-link" href={`${import.meta.env.BASE_URL || '/'}legal/privacy.html`} target="_blank" rel="noreferrer">Privacy</a>
                </div>
            </div>
        </div>
    )
}
