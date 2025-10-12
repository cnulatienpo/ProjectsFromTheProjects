import React from 'react';
import { Outlet, Link } from 'react-router-dom';

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

import { createRoot } from "react-dom/client";
import App from "./App";

// Optional: hybrid API boot (ignore if file missing)
try { const mod = await import("./lib/api-boot"); await mod.bootApi?.(); } catch { }

import "./brutalist.css";
import "./theme.css";

console.info("[vite] UI booting…");
const root = document.getElementById("root");
if (!root) {
    const div = document.createElement("div");
    div.id = "root";
    document.body.appendChild(div);
    createRoot(div).render(<App />);
} else {
    createRoot(root).render(<App />);
}
