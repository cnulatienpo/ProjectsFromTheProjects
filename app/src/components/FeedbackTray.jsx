// app/src/components/FeedbackTray.jsx
export default function FeedbackTray({
    text = "",
    minWords = 30,
    memo = [],
    onSubmit,
    onRetry,
    onNext,
    onSkip,
    submitting = false,
    error = null
}) {
    const words = (text || '').trim().split(/\s+/).filter(Boolean).length || 0
    const canSubmit = words >= (minWords || 30)

    return (
        <div>
            {/* optional memo lines already rendered above as "ray ray says:"; keep this light */}
            {Array.isArray(memo) && memo.length > 0 && (
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                    {memo.map((m, i) => <li key={i}>{String(m)}</li>)}
                </ul>
            )}

            {error && (
                <div className="feedback-error" style={{ color: '#b54708', marginTop: 8 }}>{String(error)}</div>
            )}

            <div className="pfp-actions" style={{ marginTop: 12 }}>
                <button className="pfp-btn" disabled={!canSubmit || submitting} onClick={onSubmit}>{submitting ? 'Submitting…' : 'Submit'}</button>
                <button className="pfp-btn" onClick={onRetry} disabled={submitting}>Try again</button>
                <button className="pfp-btn" onClick={onNext} disabled={submitting}>Next</button>
                <button className="pfp-btn" onClick={onSkip} disabled={submitting}>I don’t feel like it</button>
            </div>
        </div>
    )
}
