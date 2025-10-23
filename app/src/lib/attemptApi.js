// app/src/lib/attemptApi.js
import * as API from '@/lib/apiBase.js'

const makeUrl = typeof API.api === 'function'
  ? (p) => API.api(p)
  : (p) => {
      const base = typeof API.API_BASE === 'string' ? API.API_BASE.replace(/\/$/, '') : ''
      return base ? base + (p.startsWith('/') ? p : `/${p}`) : (p.startsWith('/') ? p : `/${p}`)
    }

const safeFetchJSON = typeof API.safeFetchJSON === 'function'
  ? (url, init) => API.safeFetchJSON(url, init)
  : async (url, init) => {
      const res = await fetch(url, init)
      if (!res.ok) {
        const text = await res.text().catch(()=>'')
        throw new Error(`HTTP ${res.status}${text ? ` – ${text.slice(0,120)}` : ''}`)
      }
      return res.json()
    }

export async function fetchNext(userId = 'dev') {
  const url = makeUrl(`/api/next?userId=${encodeURIComponent(userId)}`)
  return safeFetchJSON(url)
}

export async function submitAttempt(input = {}) {
  if (!input || typeof input !== 'object') throw new Error('submitAttempt requires an object payload')

  const hasModernShape = 'itemId' in input || 'answer' in input || 'mode' in input
  if (!hasModernShape) {
    const legacy = {
      id: input.id,
      text: input.text,
      minWords: input.minWords,
    }
    return safeFetchJSON(makeUrl('/attempt'), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(legacy),
    })
  }

  const {
    userId = 'dev',
    itemId,
    mode = 'why',
    answer,
    reason,
  } = input

  if (!itemId) throw new Error('submitAttempt requires itemId')

  return safeFetchJSON(makeUrl('/api/attempt'), {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ userId, itemId, mode, answer, reason }),
  })
}

export async function skipItem(arg1, arg2, arg3) {
  let userId = 'dev'
  let itemId
  let reason = 'user_skip'
  let mode

  if (arg1 && typeof arg1 === 'object' && !Array.isArray(arg1)) {
    userId = arg1.userId ?? 'dev'
    itemId = arg1.itemId ?? arg1.id ?? arg1.lessonId
    mode = arg1.mode
    reason = arg1.reason ?? (mode ? `mode:${mode}` : 'user_skip')
  } else {
    userId = arg1 ?? 'dev'
    itemId = arg2
    mode = arg3
    reason = mode ? `mode:${mode}` : 'user_skip'
  }

  if (!itemId) throw new Error('skipItem requires itemId')

  const body = { userId, itemId, reason }
  if (mode) body.mode = mode

  return safeFetchJSON(makeUrl('/api/skip'), {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
}
