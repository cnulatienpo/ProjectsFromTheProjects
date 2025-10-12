import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

import './index.css';
import './styles/brutalist.css';
import './styles/brutalist-overrides.css';

document.documentElement.classList.add('brutalist');
document.body.classList.add('brutalist');

const rootEl =
    document.getElementById('root') ??
    (() => { const d = document.createElement('div'); d.id = 'root'; document.body.appendChild(d); return d; })();

createRoot(rootEl).render(<App />);
