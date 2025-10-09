import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import GameLayout from '@/components/GameLayout.tsx'
import GameItem from '@/components/GameItem.tsx'
import LevelUpModal from '@/components/LevelUpModal.jsx'
import BadgeStrip from '@/components/BadgeStrip.jsx'
import { toSpec } from '@/lib/gameAdapter.js'
import { api } from '@/lib/apiBase.js'

export default function GameRunner() {
    const { id } = useParams()
    const nav = useNavigate()
    const [game, setGame] = useState(null)
    const [points, setPoints] = useState(0)
    const [feedback, setFeedback] = useState('')
    const [err, setErr] = useState('')
    const [levelUp, setLevelUp] = useState(null)
    const [newBadges, setNewBadges] = useState([])

    useEffect(() => {
        setErr(''); setFeedback(''); setPoints(0); setLevelUp(null); setNewBadges([])
        fetch(api(`/catalog/game/${id}`))
            .then(r => r.ok ? r.json() : Promise.reject(r.status))
            .then(setGame)
            .catch(e => setErr(`Could not load game "${id}" (${e}).`))
    }, [id])

    const spec = game ? toSpec(game) : null

    function handleResult(r) {
        setFeedback(r.feedback)
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

    return (
        <>
            <GameLayout
                title={game?.title || 'Loading…'}
                points={points}
                feedback={<>{err ? <span style={{ color: 'tomato' }}>{err}</span> : feedback}<BadgeStrip badges={newBadges} /></>}
                onPrev={() => nav(-1)}
                onSubmit={() => {
                    const btn = document.querySelector('button[aria-hidden="true"]')
                    btn && btn.click()
                }}
                onNext={() => game?.next ? nav(`/game/run/${game.next}`) : nav('/game/start')}
                submitLabel="Check"
            >
                {!game && !err && <div className="read-box"><p>Loading…</p></div>}
                {err && <div className="read-box"><p>{err}</p></div>}
                {spec && <GameItem spec={spec} onResult={handleResult} />}
            </GameLayout>
            <LevelUpModal
                show={!!levelUp}
                from={levelUp?.from}
                to={levelUp?.to}
                onClose={() => setLevelUp(null)}
            />
        </>
    )
}
