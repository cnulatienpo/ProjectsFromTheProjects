// app/src/lib/apiBase.js
// Dev: Vite proxy forwards /api -> http://localhost:3002
// Prod: server serves app/dist and the same /api routes; relative paths just work.
export const API_BASE = '';
export function api(path) {
  const base = API_BASE.replace(/\/$/, '');
  return `${base}${path}`;
}
export async function safeFetchJSON(url, init) {
  const res = await fetch(url, init);
  if (!res.ok) {
    let text = '';
    try { text = await res.text(); } catch {}
    throw new Error(`HTTP ${res.status}${text ? ` – ${text.slice(0,120)}` : ''}`);
  }
  return res.json();
}
