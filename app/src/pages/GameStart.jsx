import { Link } from 'react-router-dom'
import SceneShell from '../components/SceneShell.jsx'

export default function GameStart() {
    return (
        <SceneShell title="Start">
            <p style={{ marginTop: 0 }}>
                Choose a starting lane. You can jump around later.
            </p>

            <ul style={{ paddingLeft: '1.2rem', lineHeight: 1.6 }}>
                <li>
                    <Link className="start-link" to="/game/lesson/grammar-101">New Game → Grammar 101</Link>
                </li>
                <li style={{ marginTop: '.75rem' }}>
                    <Link className="start-link" to="/game/lesson/devices-101">New Game → Literary Devices 101</Link>
                </li>
                <li style={{ marginTop: '.75rem' }}>
                    <a className="start-link" href="#" onClick={e => { e.preventDefault(); alert('Continue: no saves yet.'); }}>
                        Continue (coming soon)
                    </a>
                </li>
            </ul>
        </SceneShell>
    )
}
