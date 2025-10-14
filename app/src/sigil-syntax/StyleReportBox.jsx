import StyleReportBox from '@sigil/StyleReportBox'
import { api } from '@/lib/apiBase.js'
import { useState } from 'react'

export default function GameRunner() {
    const [styleRpt, setStyleRpt] = useState(null)
    const [feedback, setFeedback] = useState('')

    async function handleResult(r) {
        setFeedback(r.feedback)
        setStyleRpt(null)
        if (game?.input_type === 'write' && r.response && typeof r.response === 'string') {
            try {
                const resp = await fetch(api('/style-report'), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: r.response })
                })
                if (resp.ok) setStyleRpt(await resp.json())
            } catch { }
        }
        // ...existing /api/submit logic...
    }

    return (
        <div>
            {/* ...existing JSX... */}
            <div>{feedback}<StyleReportBox report={styleRpt} /></div>
        </div>
    )
}
