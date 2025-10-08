function resolveApiBase() {
    const base = (import.meta.env.VITE_API_BASE || '/api').replace(/\/+$/, '')
    return base
}
