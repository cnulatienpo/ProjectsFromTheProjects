import { useState, useEffect } from 'react'

export default function LessonUI({
    title = 'Lesson',
    lessonText,
    initialDraftKey,
    onSubmit, onSkip, onNext, onRetry,
    theme = 'light',
    feedback = '',
    onSaveCloud, onLoadCloud,
    registerSetDraft
}) {
    const [draft, setDraft] = useState('')

    useEffect(() => {
        if (!initialDraftKey) return
        const saved = localStorage.getItem(initialDraftKey)
        if (saved) setDraft(saved)
    }, [initialDraftKey])

    useEffect(() => {
        if (!initialDraftKey) return
        const id = setTimeout(() => localStorage.setItem(initialDraftKey, draft), 400)
        return () => clearTimeout(id)
    }, [draft, initialDraftKey])

    useEffect(() => {
        registerSetDraft && registerSetDraft(setDraft)
    }, [registerSetDraft])

    return (
        <div className={`lesson-page ${theme === 'dark' ? 'dark' : ''}`}>
            <div className="wrap">
                <h1 className="lesson-title">{title}</h1>
                <section className="read-box" aria-label="Reading">
                    {typeof lessonText === 'string' ? <p>{lessonText}</p> : lessonText}
                </section>
                <section className="editor-wrap" aria-label="Your Writing">
                    <textarea
                        className="editor"
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        placeholder="Type your work here…"
                    />
                </section>
                <div className="btn-row">
                    <button className="btn primary" onClick={() => onSubmit?.(draft)}>Submit</button>
                    <button className="btn" onClick={() => onSkip?.()}>Skip</button>
                    <button className="btn" onClick={() => onNext?.(draft)}>Next</button>
                    <button className="btn" onClick={() => { setDraft(''); onRetry?.() }}>Try Again</button>
                </div>
                {(onSaveCloud || onLoadCloud) && (
                    <div className="btn-row" style={{ marginTop: '-.25rem' }}>
                        {onSaveCloud && (
                            <button className="btn" onClick={async () => {
                                await onSaveCloud(draft)
                            }}>Save draft → cloud</button>
                        )}
                        {onLoadCloud && (
                            <button className="btn" onClick={async () => {
                                const txt = await onLoadCloud()
                                if (typeof txt === 'string') {
                                    setDraft(txt)
                                }
                            }}>Load last draft</button>
                        )}
                    </div>
                )}
                <section className="feedback-box" aria-live="polite" aria-label="Feedback">
                    <div className="feedback-head">Ray Ray Says:</div>
                    <div className="feedback-body">
                        {feedback ? feedback : <em>(Your feedback will appear here after you submit.)</em>}
                    </div>
                </section>
            </div>
        </div>
    )
}
