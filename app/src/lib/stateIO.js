const KEY = 'ld:store:v1' // same key used by the in-memory store
export function exportState() {
    try { return localStorage.getItem(KEY) || '{}' } catch { return '{}' }
}
export function importState(json) {
    try {
        const obj = JSON.parse(json)
        localStorage.setItem(KEY, JSON.stringify(obj))
        return true
    } catch { return false }
}
