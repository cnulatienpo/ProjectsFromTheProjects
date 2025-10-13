import type { JSX } from 'react';
import { Outlet, Link } from 'react-router-dom';

export default function SigilSyntaxRoot(): JSX.Element {
    return (
        <div className="brutalist-root" style={{ padding: '1rem' }}>
            <nav style={{ marginBottom: '1rem' }}>
                <Link to="/">Home</Link> | <Link to="/play">Play</Link> | <Link to="/cutgames">Cut Games</Link>
            </nav>
            <Outlet />
        </div>
    );
}
