import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function BundleInfo() {
    const [info, setInfo] = useState(null)
    const [ids, setIds] = useState([])
    const [input, setInput] = useState('')
    const nav = useNavigate()

    useEffect(() => {
        fetch('/bundle/info').then(r => r.json()).then(setInfo)
        fetch('/catalog/games').then(r => r.json()).then(d => setIds(d.games || []))
    }, [])

    return (
        <div style={{ maxWidth: 600, margin: '2rem auto', padding: 24, background: '#f9f9f9', borderRadius: 8 }}>
            <h2>Bundle Info</h2>
            {info && (
                <div>
                    <div><strong>Version:</strong> {info.version}</div>
                    <div><strong>Generated:</strong> {info.generated_at}</div>
                    <div><strong>Items:</strong> {info.counts.items}</div>
                    <div><strong>Lessons:</strong> {info.counts.lessons}</div>
                </div>
            )}
            <div style={{ margin: '1.5em 0' }}>
                <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Game ID"
                    style={{ marginRight: 8 }}
                />
                <button className="btn" onClick={() => input && nav(`/game/run/${input}`)}>Open game by ID</button>
            </div>
            <div>
                <h4>First 25 Game IDs:</h4>
                <ul>
                    {ids.slice(0, 25).map(id => (
                        <li key={id}>
                            <a href={`/game/run/${id}`}>{id}</a>
                        </li>
                    ))}
                </ul>
            </div>
            <div style={{ marginTop: 16 }}>
                <a href="/catalog/games">Raw /catalog/games</a>
            </div>
        </div>
    )
}
