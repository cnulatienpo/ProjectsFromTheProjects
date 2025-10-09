import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import GameLayout from '@/components/GameLayout.tsx'
import GameItem from '@/components/GameItem.tsx'
import NotesPanel from '@/components/NotesPanel.jsx'
import LevelUpModal from '@/components/LevelUpModal.jsx'
import BadgeStrip from '@/components/BadgeStrip.jsx'
import { toSpec } from '@/lib/gameAdapter.js'
import { api } from '@/lib/apiBase.js'

export default function GameRunner() {
    const { id } = useParams()
    const nav = useNavigate()
    const [game, setGame] = useState(null)
    const [points, setPoints] = useState(0)
    const [feedback, setFeedback] = useState([])
    const [err, setErr] = useState('')
    const [levelUp, setLevelUp] = useState(null)
    const [newBadges, setNewBadges] = useState([])

    useEffect(() => {
        setErr(''); setFeedback([]); setPoints(0); setLevelUp(null); setNewBadges([])
        fetch(api(`/catalog/game/${id}`))
            .then(r => r.ok ? r.json() : Promise.reject(r.status))
            .then(setGame)
            .catch(e => setErr(`Could not load game "${id}" (${e}).`))
    }, [id])

    const spec = game ? toSpec(game) : null

    function handleResult(r) {
        const lines = Array.isArray(r.feedback)
            ? r.feedback
            : typeof r.feedback === 'string'
                ? r.feedback.split(/\r?\n/).map(s => s.trim()).filter(Boolean)
                : r.feedback != null
                    ? [String(r.feedback)].filter(Boolean)
                    : []
        setFeedback(lines)
        // ask backend to award XP + badges using this attempt
        const payload = { user_id: 'local-user', item_id: game.id, response: r.response, score: r.score }
        fetch(api('/api/submit'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
            .then(resp => resp.ok ? resp.json() : Promise.reject(resp.status))
            .then(data => {
                setPoints(p => p + Math.round(r.score * 10))
                if (data.levelUp) setLevelUp(data.levelUp)
                setNewBadges(data.newBadges || [])
            })
            .catch(() => { })
    }

    const rayLines = err
        ? []
        : (Array.isArray(feedback)
            ? feedback
            : (typeof feedback === 'string'
                ? feedback.split(/\r?\n/).map(s => s.trim()).filter(Boolean)
                : feedback ? [String(feedback)] : []))

    const feedbackList = err
        ? <span style={{ color: 'tomato' }}>{err}</span>
        : (rayLines.length ? (
            <ul style={{ margin: 0, paddingLeft: '1.1rem', lineHeight: 1.5 }}>
                {rayLines.map((line, idx) => (
                    <li key={idx}>{line}</li>
                ))}
            </ul>
        ) : null)

    const badgeNode = newBadges.length ? <BadgeStrip badges={newBadges} /> : null
    const feedbackContent = feedbackList || badgeNode ? <>{feedbackList}{badgeNode}</> : null

    return (
        <>
            <GameLayout
                title={game?.title || 'Loading…'}
                points={points}
                feedback={feedbackContent}
                onPrev={() => nav(-1)}
                onSubmit={() => {
                    const btn = document.querySelector('button[aria-hidden="true"]')
                    btn && btn.click()
                }}
                onNext={() => game?.next ? nav(`/game/run/${game.next}`) : nav('/game/start')}
                submitLabel="Check"
            >
                {/* Two-column responsive layout: editor (2fr) + notes (1fr) */}
                <div
                    className="editor-notes-grid"
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '2fr 1fr',
                        gap: 16,
                        alignItems: 'stretch'
                    }}
                >
                    <div className="editor-pane" style={{ minHeight: 420 }}>
                        {/* your existing read box + writing editor goes here */}
                        {!game && !err && <div className="read-box"><p>Loading…</p></div>}
                        {err && <div className="read-box"><p>{err}</p></div>}
                        {spec && <GameItem spec={spec} onResult={handleResult} />}
                    </div>

                    <div className="notes-pane" style={{ minHeight: 420 }}>
                        <NotesPanel
                            gameId={game?.id}
                            rayLines={rayLines}
                            initialValue=""
                            onChange={() => {}}
                        />
                    </div>
                </div>
            </GameLayout>
            <style>{`
  @media (max-width: 900px) {
    .editor-notes-grid { grid-template-columns: 1fr; }
    .notes-wrap { transform: none; margin-top: 12px; }
  }
`}</style>
            <LevelUpModal
                show={!!levelUp}
                from={levelUp?.from}
                to={levelUp?.to}
                onClose={() => setLevelUp(null)}
            />
        </>
    )
}
