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
  const res = await safeFetchJSON(makeUrl(`/api/next?userId=${encodeURIComponent(userId)}`));
  if (!res || typeof res !== 'object') return res ?? null;

  const base = res && typeof res.item === 'object' && res.item !== null ? res.item : res;
  if (!base || typeof base !== 'object') return null;

  const item = { ...base };
  if (item.id == null && res.id != null) {
    item.id = res.id;
  }
  if (item.id == null) return null;
  item.id = String(item.id);

  const mode = res.mode ?? base.mode;
  if (!item.mode && mode) {
    item.mode = mode;
  }
  if (!item.mode) {
    item.mode = 'why';
  }

  const introducesTop = res.introduces_beats;
  if (!Array.isArray(item.introduces_beats) && Array.isArray(introducesTop)) {
    item.introduces_beats = introducesTop;
  }
  if (Array.isArray(item.introduces_beats)) {
    item.introduces_beats = item.introduces_beats
      .map((beat) => (beat == null ? '' : String(beat).trim()))
      .filter(Boolean);
  }

  return item;
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
