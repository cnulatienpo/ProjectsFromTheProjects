const K = 'pfp:userId'

function createId(){
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    try { return crypto.randomUUID() } catch {}
  }
  const bytes = Array.from({ length: 16 }, () => Math.floor(Math.random() * 256))
  const toHex = (arr) => arr.map(b => b.toString(16).padStart(2, '0')).join('')
  const parts = [
    toHex(bytes.slice(0, 4)),
    toHex(bytes.slice(4, 6)),
    toHex(bytes.slice(6, 8)),
    toHex(bytes.slice(8, 10)),
    toHex(bytes.slice(10, 16)),
  ]
  return parts.join('-')
}

export function getUserId() {
  let id = null
  try { id = localStorage.getItem(K) } catch {}
  if (!id) {
    id = createId()
    try { localStorage.setItem(K, id) } catch {}
  }
  return id
}
