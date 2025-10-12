import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import './styles/brutalist.css';
import './styles/brutalist-overrides.css';

const el = document.getElementById('root');
if (!el) throw new Error('Missing #root in index.html');

document.documentElement.classList.add('brutalist');
document.body.classList.add('brutalist');

createRoot(el).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
