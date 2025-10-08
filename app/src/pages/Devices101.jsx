import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import LessonUI from '../components/LessonUI.jsx'
import UploadWidget from '../components/UploadWidget.jsx'

export default function Devices101() {
    const nav = useNavigate()
    const [fb, setFb] = useState('')

    return (
        <>
            <LessonUI
                theme="dark"
                title="Literary Devices 101 — Placeholder"
                initialDraftKey="ld:devices101:draft"
                lessonText={
                    <>
                        <p><strong>Read:</strong> This is a placeholder for your Literary Devices lesson text.
                            The box should grow with whatever you paste here—short or long—so the page scrolls,
                            not an inner scroller.</p>
                        <p>Examples to come: metaphor, simile, alliteration, irony…</p>
                    </>
                }
                feedback={fb}
                onSubmit={(draft) => {
                    if (!draft.trim()) {
                        setFb("Start by writing a single image using a device. Example: a simile—“Her laugh was like loose change in a dryer.” Then try a metaphor and alliteration.")
                    } else {
                        setFb("Solid. Tag where you used a device (SIMILE / METAPHOR / ALLITERATION) so we can talk function, not vibe. We’ll get specific next screen.")
                    }
                    localStorage.setItem('ld:devices101:lastSubmit', String(Date.now()))
                }}
                onSkip={() => nav('/game/start')}
                onNext={() => nav('/game/start')}
                onRetry={() => setFb('')}
            />
            {/* DEV ONLY: Upload widget */}
            {true && <UploadWidget />}
        </>
    )
}
