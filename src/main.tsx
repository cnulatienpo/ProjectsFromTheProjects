import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { assertMinimum, loadAllPacksSafe, reportPackHealth } from './data/loadAllPacksSafe';

import './index.css';
import './styles/brutalist.css';
import './styles/brutalist-overrides.css';

document.documentElement.classList.remove('brutalist');
document.body.classList.remove('brutalist');

const rootEl =
    document.getElementById('root') ??
    (() => { const d = document.createElement('div'); d.id = 'root'; document.body.appendChild(d); return d; })();

if (import.meta.env.DEV) {
  void (async () => {
    try {
      const { packs, report, total } = await loadAllPacksSafe();
      reportPackHealth(packs, report);
      assertMinimum(total, 2000);
    } catch (error) {
      console.error('Failed to load word pack health report:', error);
    }
  })();
}

createRoot(rootEl).render(<App />);
