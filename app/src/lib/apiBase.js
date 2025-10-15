const PROD = import.meta.env.VITE_PROD_API || ''
export const api = (p = '') => {
  const base = (import.meta.env.DEV ? '' : PROD).replace(/\/+$/, '')
  const path = p.startsWith('/') ? p : `/${p}`
  return `${base}${path}`
}

export async function safeFetchJSON(url, init) {
  const res = await fetch(url, init)
  const ct = res.headers.get('content-type') || ''
  if (!res.ok) {
    const body = ct.includes('html') ? await res.text() : ''
    throw new Error(`HTTP ${res.status} for ${url}${ct.includes('html') ? ' (HTML received)' : ''}${body ? ' :: ' + body.slice(0,120) : ''}`)
  }
  if (ct.includes('html')) {
    const body = await res.text()
    throw new Error(`Expected JSON from ${url}, but got HTML (likely a 404 or SPA index). First bytes: ${body.slice(0,120)}`)
  }
  return res.json()
}
