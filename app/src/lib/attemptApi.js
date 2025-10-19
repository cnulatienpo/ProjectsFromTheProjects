import * as API from '@/lib/apiBase'

const makeUrl = typeof API.api === 'function'
  ? (path) => API.api(path)
  : (path) => {
      const base = typeof API.apiBase === 'string' ? API.apiBase.replace(/\/$/, '') : ''
      const p = path.startsWith('/') ? path : `/${path}`
      return `${base}${p}`
    }

const safeFetchJSON = API.safeFetchJSON

export async function submitAttempt({ id, text, minWords }) {
    return safeFetchJSON(makeUrl('/attempt'), {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id, text, minWords })
    })
}
