import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import LessonUI from '../components/LessonUI.jsx'
import { saveDraftToCloud, loadLastDraftFromCloud } from '../lib/drafts.js'

export default function Grammar101() {
    const nav = useNavigate()
    const [fb, setFb] = useState('')
    const [setDraftFn, setSetDraftFn] = useState(null)

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
            registerSetDraft={fn => setSetDraftFn(() => fn)}
            onSubmit={(draft) => {
                const words = draft.trim().split(/\s+/).filter(Boolean).length
                const lines = draft.split(/\n/).length
                if (!draft.trim()) {
                    setFb("Write something in the big black box, even if it’s ugly. I’ll react after you give me raw clay.")
                } else if (words < 25) {
                    setFb("Good start. Now give me 2 more versions of the same idea: one with a single modifier, one with a connector (and/but/so). Keep the subject–verb spine obvious.")
                } else if (lines < 3) {
                    setFb("I see words but not the three versions. Break them into 3 short lines/paragraphs so we can compare the spine.")
                } else {
                    setFb("Nice. Spine is visible. Next time: try swapping in a stronger verb for version #2, not just piling on adjectives.")
                }
                localStorage.setItem('ld:grammar101:lastSubmit', String(Date.now()))
            }}
            onSkip={() => nav('/game/start')}
            onNext={() => nav('/game/lesson/devices-101')}
            onRetry={() => setFb('')}
            onSaveCloud={async (draft) => {
                const key = await saveDraftToCloud({ lessonId: 'grammar-101', text: draft })
                setFb(`Saved to cloud as: ${key}`)
            }}
            onLoadCloud={async () => {
                try {
                    const txt = await loadLastDraftFromCloud({ lessonId: 'grammar-101' })
                    setDraftFn && setDraftFn(txt)
                    setFb('Loaded last cloud draft.')
                    return txt
                } catch (e) {
                    setFb('No cloud draft found yet.')
                    return ''
                }
            }}
        />
    )
}
