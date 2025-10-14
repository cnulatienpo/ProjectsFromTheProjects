import React, { useState } from 'react'

type Mode = 'read' | 'write' | 'mcq'

export type GameSpec = {
    id: string
    mode: Mode
    prompt: React.ReactNode
    choices?: string[]
    correctIndex?: number
    minWords?: number
    evaluate?: (input: string | number | null) => { score: number; feedback: string }
}

type Props = {
    spec: GameSpec
    onResult: (r: { score: number; feedback: string }) => void
}

export default function GameItem({ spec, onResult }: Props) {
    const [text, setText] = useState('')
    const [choice, setChoice] = useState<number | null>(null)

    function defaultEvaluate(): { score: number; feedback: string } {
        if (spec.mode === 'mcq') {
            const ok = choice !== null && choice === spec.correctIndex
            return { score: ok ? 1 : 0, feedback: ok ? 'Yep.' : 'Not quite—look back at the prompt.' }
        }
        if (spec.mode === 'write') {
            const words = text.trim().split(/\s+/).filter(Boolean).length
            const need = spec.minWords ?? 30
            if (words === 0) return { score: 0, feedback: 'Put words in the box. Any words.' }
            if (words < need) return { score: 0.5, feedback: `Give me ~${need} words so I can judge the shape.` }
            return { score: 1, feedback: 'Good—now trim one sentence and strengthen a verb.' }
        }
        return { score: 1, feedback: 'Logged it. Ready to move.' }
    }

    function onSubmit() {
        const evalr = spec.evaluate
            ? spec.evaluate(spec.mode === 'mcq' ? choice : (spec.mode === 'write' ? text : null))
            : defaultEvaluate()
        onResult(evalr)
    }

    return (
        <div>
            <section className="read-box" aria-label="Prompt">
                {spec.prompt}
            </section>
            {spec.mode === 'write' && (
                <section className="editor-wrap" aria-label="Your Writing">
                    <textarea
                        className="editor"
                        value={text}
                        onChange={e => setText(e.target.value)}
                        placeholder="Type your work here…"
                    />
                </section>
            )}
            {spec.mode === 'mcq' && (
                <section className="editor-wrap" aria-label="Choices">
                    <div style={{ maxWidth: 900, margin: '0 auto' }}>
                        {spec.choices?.map((c, i) => (
                            <label key={i} style={{ display: 'block', marginBottom: 8, cursor: 'pointer' }}>
                                <input
                                    type="radio"
                                    name="mcq"
                                    checked={choice === i}
                                    onChange={() => setChoice(i)}
                                    style={{ marginRight: 8 }}
                                />
                                {c}
                            </label>
                        ))}
                    </div>
                </section>
            )}
            <button className="btn primary" onClick={onSubmit} style={{ display: 'none' }} aria-hidden="true">
                Hidden submit
            </button>
        </div>
    )
}
