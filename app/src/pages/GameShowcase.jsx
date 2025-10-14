import { useState } from 'react'
import { GameLayout, GameItem } from '@sigil'

export default function GameShowcase() {
    const [points, setPoints] = useState(0)
    const [feedback, setFeedback] = useState('')
    const [step, setStep] = useState(0)

    const specs = [
        {
            id: 'read-1', mode: 'read',
            prompt: (
                <>
                    <p><strong>Reading:</strong> A sentence needs a subject and a verb. Example:
                        <em> “Dogs run.”</em> Add detail without breaking the spine.</p>
                </>
            )
        },
        {
            id: 'write-1', mode: 'write', minWords: 30,
            prompt: <p>Write three versions of the same idea. (1) bare, (2) + one modifier, (3) + connector.</p>
        },
        {
            id: 'mcq-1', mode: 'mcq', correctIndex: 1,
            prompt: <p>Which line keeps a clear subject–verb spine?</p>,
            choices: [
                'Running quickly down the alley, because late again.',
                'The courier sprints down the alley.',
                'Since it was raining and the traffic was bad which made them late.'
            ]
        }
    ]

    const spec = specs[step]

    function handleResult(r) {
        setFeedback(r.feedback)
        setPoints(p => p + Math.round(r.score * 10))
    }

    return (
        <GameLayout
            title="Game Showcase"
            points={points}
            feedback={feedback}
            onPrev={step > 0 ? () => setStep(s => Math.max(0, s - 1)) : undefined}
            onSubmit={() => {
                const btn = document.querySelector('button[aria-hidden="true"]')
                btn && btn.click()
            }}
            onNext={step < specs.length - 1 ? () => { setFeedback(''); setStep(s => s + 1) } : undefined}
            submitLabel="Check"
        >
            <GameItem spec={spec} onResult={handleResult} />
        </GameLayout>
    )
}
