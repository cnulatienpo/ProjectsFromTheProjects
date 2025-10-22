/**
 * Simple client for the game API.
 * All calls hit the same origin (server/index.js proxies /api/*).
 */
const API_BASE = ''; // same-origin

export async function fetchNext(userId = 'dev') {
  const r = await fetch(`${API_BASE}/api/next`, {
    headers: { 'x-user-id': userId }
  });
  if (!r.ok) throw new Error(`next: HTTP ${r.status}`);
  return r.json();
}

export async function submitAttempt({ userId = 'dev', itemId, mode, answer }) {
  const r = await fetch(`${API_BASE}/api/attempt`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-user-id': userId },
    body: JSON.stringify({ userId, itemId, mode, answer })
  });
  if (!r.ok) throw new Error(`attempt: HTTP ${r.status}`);
  return r.json();
}

export async function skipItem({ userId = 'dev', itemId, mode, reason = 'user_skip' }) {
  const r = await fetch(`${API_BASE}/api/skip`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-user-id': userId },
    body: JSON.stringify({ userId, itemId, mode, reason })
  });
  if (!r.ok) throw new Error(`skip: HTTP ${r.status}`);
  return true;
}
export async function fetchLatestReport(userId = 'dev') {
  const res = await fetch(`/api/reports/latest?userId=${encodeURIComponent(userId)}`);
  if (!res.ok) throw new Error(`latest report HTTP ${res.status}`);
  const data = await res.json();
  // shape: { ok, userId, memo: { title, body, badges } }
  return data?.memo || null;
}
