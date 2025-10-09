import React from 'react'

type Props = {
    title: string
    points?: number
    badge?: string
    feedback?: React.ReactNode
    children: React.ReactNode
    onPrev?: () => void
    onSubmit?: () => void
    onNext?: () => void
    submitLabel?: string
}

export default function GameLayout({
    title, points = 0, badge, feedback, children,
    onPrev, onSubmit, onNext, submitLabel = 'Submit'
}: Props) {
    return (
        <div className="lesson-page dark">
            <div className="wrap">
                <h1 className="lesson-title">{title}</h1>
                <section className="read-box" aria-label="Status">
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        <div><strong>Points:</strong> {points}</div>
                        {badge && <div><strong>Badge:</strong> {badge}</div>}
                    </div>
                </section>
                <section className="editor-wrap" aria-label="Game Content">
                    {children}
                </section>
                <div className="btn-row">
                    {onPrev && <button className="btn" onClick={onPrev}>Previous</button>}
                    {onSubmit && <button className="btn primary" onClick={onSubmit}>{submitLabel}</button>}
                    {onNext && <button className="btn" onClick={onNext}>Next</button>}
                </div>
                <section className="feedback-box" aria-live="polite" aria-label="Feedback">
                    <div className="feedback-head">Ray Ray Says:</div>
                    <div className="feedback-body">
                        {feedback || <em>(Your feedback will appear here after you submit.)</em>}
                    </div>
                </section>
            </div>
        </div>
    )
}
