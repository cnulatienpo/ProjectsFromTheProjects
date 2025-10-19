import { api, safeFetchJSON } from '@/lib/apiBase'
import { getUserId } from '@/lib/userId.js'
import { getLastSeen } from '@/lib/lastSeen.js'

export async function markStarted(lessonId){
  const userId = getUserId()
  return safeFetchJSON(api('/progress/mark'), {
    method:'POST',
    headers:{ 'content-type':'application/json' },
    body: JSON.stringify({ userId, lessonId, kind:'started' })
  })
}
export async function markSubmitted(lessonId, verdict){
  const userId = getUserId()
  return safeFetchJSON(api('/progress/mark'), {
    method:'POST',
    headers:{ 'content-type':'application/json' },
    body: JSON.stringify({ userId, lessonId, kind:'submitted', verdict })
  })
}
export async function fetchNextId(validIds = []){
  const userId = getUserId()
  // 1) Try backend with a 3s timeout
  const ctl = new AbortController()
  const t = setTimeout(()=>ctl.abort(), 3000)
  try {
    const res = await fetch(api(`/progress/next?userId=${encodeURIComponent(userId)}`), { signal: ctl.signal })
    clearTimeout(t)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const j = await res.json()
    const id = j?.nextId || null
    if (id && (!Array.isArray(validIds) || validIds.includes(id))) return id
  } catch {
    clearTimeout(t)
  }
  // 2) Fallback to local last seen (only if it’s in the catalog)
  const local = getLastSeen()
  if (local && Array.isArray(validIds) && validIds.includes(local)) return local
  return null
}
