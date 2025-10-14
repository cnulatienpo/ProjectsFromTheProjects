const PROD = (import.meta.env.VITE_PROD_API || '').toString().trim()
const DEV_BASE = (import.meta.env.VITE_API_BASE || '').toString().trim()

function normalizeBase(base) {
  return base.replace(/\/+$/, '')
}

export function api(pathname = '') {
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`
  if (PROD && /^https?:\/\//i.test(PROD)) {
    return `${normalizeBase(PROD)}${path}`
  }
  const base = DEV_BASE ? normalizeBase(DEV_BASE) : ''
  return `${base}${path}`
}

export function apiBase() {
  if (PROD && /^https?:\/\//i.test(PROD)) return normalizeBase(PROD)
  return DEV_BASE ? normalizeBase(DEV_BASE) : ''
}
