import { api, safeFetchJSON } from '@/lib/apiBase'
import { getUserId } from '@/lib/userId.js'

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
export async function fetchNextId(){
  const userId = getUserId()
  const j = await safeFetchJSON(api(`/progress/next?userId=${encodeURIComponent(userId)}`))
  return j?.nextId || null
}
