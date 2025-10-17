import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
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
      assertMinimum(total);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('Continuing without full word pack (dev):', error);
      } else {
        throw error;
      }
    }
  })();
}

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
