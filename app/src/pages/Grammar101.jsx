import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import LessonUI from '../components/LessonUI.jsx'
import { Store } from '@/domain/store.ts'

export default function Grammar101() {
    const nav = useNavigate()
    const [fb, setFb] = useState('')

    return (
        <LessonUI
            title="Grammar 101 — Sentence Basics"
            initialDraftKey="ld:grammar101:draft"
            lessonText={
                <>
                    <p><strong>Read:</strong> A sentence needs a subject and a verb. Keep it simple:
                        <em> “Dogs (subject) run (verb).”</em> Add detail without breaking the spine.</p>
                    <p>Write 3 versions of the same idea: (1) bare-bones, (2) add one modifier, (3) add one
                        connector but still clear.</p>
                </>
            }
            feedback={fb}
            onSubmit={(draft) => {
                const words = draft.trim().split(/\s+/).filter(Boolean).length
                // simple score: 0..1
                const score = Math.max(0, Math.min(1, (words - 10) / 50))
                // record attempt (no DB — just schema-validated object)
                Store.addAttempt({
                    attempt_id: crypto.randomUUID(),
                    item_id: 'grammar-101:sentence-basics',
                    user_id: 'local',
                    response: draft,
                    score,
                    created_at: Date.now()
                })
                // add XP toward a “grammar” skill lane
                const mastery = Store.addXp({ skill: 'grammar', amount: Math.round(score * 25), last_item_id: 'grammar-101:sentence-basics' })

                // feedback
                if (!draft.trim()) {
                    setFb("Write something in the big black box. Give me raw clay to shape.")
                } else if (words < 25) {
                    setFb("Good start. Try 2 more versions—one with a modifier, one with a connector (and/but/so). Keep the subject–verb spine obvious.")
                } else {
                    setFb(`Nice. Spine is visible. XP: ${mastery.xp} (Level ${mastery.level})`)
                }
            }}
            onSkip={() => nav('/game/start')}
            onNext={() => nav('/game/lesson/devices-101')}
            onRetry={() => setFb('')}
        />
    )
}
