// app/src/lib/attemptApi.js
// Minimal, safe helpers used by SigilRunner.jsx

// Optional apiBase; if missing or partial, we safely fall back.
let API = {};
try {
  API = await import('@/lib/apiBase.js');
} catch {}

/** Build a URL using apiBase if available, else return the path unchanged. */
const makeUrl =
  typeof API.api === 'function'
    ? (p) => API.api(p)
    : (p) => {
        const base = (API.API_BASE || '').replace(/\/$/, '');
        return base ? base + p : p;
      };

/** Fetch JSON with consistent error reporting. */
async function safeFetchJSON(url, init) {
  const res = await fetch(url, init);
  if (!res.ok) {
    let text = '';
    try { text = await res.text(); } catch {}
    throw new Error(`HTTP ${res.status}${text ? ` - ${text.slice(0,120)}` : ''}`);
  }
  return res.json();
}

// --- API helpers required by SigilRunner.jsx ---
export async function fetchNext(userId = 'dev') {
  return safeFetchJSON(makeUrl(`/api/next?userId=${encodeURIComponent(userId)}`));
}

export async function submitAttempt({ userId = 'dev', itemId, mode, answer }) {
  return safeFetchJSON(makeUrl('/api/attempt'), {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ userId, itemId, mode, answer }),
  });
}

export async function skipItem({ userId = 'dev', itemId, reason = 'user_skip' } = {}) {
  return safeFetchJSON(makeUrl('/api/skip'), {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ userId, itemId, reason }),
  });
}
