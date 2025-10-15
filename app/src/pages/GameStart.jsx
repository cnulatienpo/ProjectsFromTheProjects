import { Link } from 'react-router-dom'
import SceneShell from '../components/SceneShell.jsx'

export default function GameStart() {
    const entries = [
        {
            key: 'grammar',
            node: (
                <Link className="link-white" to="/game/lesson/grammar-101">
                    New Game → Grammar 101
                </Link>
            )
        },
        {
            key: 'devices',
            node: (
                <Link className="link-white" to="/game/lesson/devices-101">
                    New Game → Literary Devices 101
                </Link>
            )
        },
        {
            key: 'continue',
            node: (
                <a
                    className="link-white"
                    href="#"
                    onClick={e => {
                        e.preventDefault()
                        alert('Continue: no saves yet.')
                    }}
                >
                    Continue (coming soon)
                </a>
            )
        }
    ]

    return (
        <SceneShell title="Literary Deviousness">
            <p style={{ marginTop: 0 }}>
                Choose a starting lane. You can jump around later.
            </p>

            <div className="games-grid">
                {entries.map(entry => (
                    <div key={entry.key} className="game-tile">
                        {entry.node}
                    </div>
                ))}
            </div>
        </SceneShell>
    )
}
