import React from 'react';
import { Outlet, Link } from 'react-router-dom';

// These CSS files are located in src/styles/
// This file is src/pages/GameRoot.tsx
// Fix the import paths so they correctly point to:
//   - src/styles/brutalist.css
//   - src/styles/theme/theme.css
// Use proper relative paths
import "../styles/brutalist.css";
import "../styles/theme/theme.css";

export default function GameRoot(): JSX.Element {
    return (
        <div className="brutalist-root" style={{ padding: '1rem' }}>
            <nav style={{ marginBottom: '1rem' }}>
                <Link to="/">Home</Link> | <Link to="/play">Play</Link> | <Link to="/cutgames">Cut Games</Link>
            </nav>
            <Outlet />
        </div>
    );
}

// Optional named export in case App.tsx uses it
export { GameRoot };

