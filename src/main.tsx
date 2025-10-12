import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Global styles (keep brutalist last so it wins)
import './index.css';
import './styles/brutalist.css';
import './styles/brutalist-overrides.css';

// Force theme classes early
document.documentElement.classList.add('brutalist');
document.body.classList.add('brutalist');

// Create or find #root, then render
const rootEl =
    document.getElementById('root') ??
    (() => {
        const d = document.createElement('div');
        d.id = 'root';
        document.body.appendChild(d);
        return d;
    })();

createRoot(rootEl).render(<App />);
