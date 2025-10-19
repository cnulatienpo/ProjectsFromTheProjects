const K = 'sigil:lastSeen:v1'

export function getLastSeen() {
  try { return localStorage.getItem(K) || null } catch { return null }
}
export function setLastSeen(lessonId) {
  try { if (lessonId) localStorage.setItem(K, lessonId) } catch {}
}
