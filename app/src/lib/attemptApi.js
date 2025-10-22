// app/src/lib/attemptApi.js
import * as API from '@/lib/apiBase.js'

// Build a URL regardless of how apiBase is authored
const makeUrl = typeof API.api === 'function'
  ? (p) => API.api(p)
  : (p) => {
      const base = (API.API_BASE || '').replace(/\/$/, '')
      return base ? base + p : p
    }

// Reuse the same safe fetch helper (if provided); otherwise a tiny fallback
const safeFetchJSON = API.safeFetchJSON || (async (url, init) => {
  const res = await fetch(url, init)
  if (!res.ok) {
    const text = await res.text().catch(()=>'')
    throw new Error(`HTTP ${res.status}${text ? ` – ${text.slice(0,120)}` : ''}`)
  }
  return res.json()
})

export async function submitAttempt({ id, text, minWords }) {
  return safeFetchJSON(makeUrl('/attempt'), {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ id, text, minWords })
  })
}
