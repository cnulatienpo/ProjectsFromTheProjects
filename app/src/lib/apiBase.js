// app/src/lib/apiBase.js
const DEV_BASE  = (import.meta.env.VITE_DEV_API || '').replace(/\/+$/, '')
const PROD_BASE = (import.meta.env.VITE_PROD_API || '').replace(/\/+$/, '')

export const api = (p = '') => {
  const path = p.startsWith('/') ? p : `/${p}`
  const base = import.meta.env.DEV ? DEV_BASE : PROD_BASE
  return `${base}${path}`
}

export async function safeFetchJSON(url, opts) {
  const r = await fetch(url, { headers: { 'accept': 'application/json' }, ...opts })
  const ct = r.headers.get('content-type') || ''
  if (!r.ok) {
    let msg = `HTTP ${r.status} for ${url}`
    if (ct.includes('application/json')) {
      const j = await r.json().catch(()=>null)
      if (j && (j.error || j.message)) msg += `: ${j.error || j.message}`
    }
    throw new Error(msg)
  }
  if (!ct.includes('application/json')) throw new Error(`HTML received for ${url}`)
  return r.json()
}
