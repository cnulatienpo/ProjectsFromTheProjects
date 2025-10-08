export function publicUrl(key) {
    // Prefer a CDN/base URL you set in .env.local
    const base = import.meta.env.VITE_B2_PUBLIC_BASEURL || ''
    if (base) return `${base.replace(/\/+$/, '')}/${key}`

    // Fallback: S3-style path (works if your bucket is public)
    // e.g. https://s3.us-west-000.backblazeb2.com/<bucket>/<key>
    const ep = import.meta.env.VITE_B2_S3_ENDPOINT
    const bucket = import.meta.env.VITE_B2_BUCKET
    if (ep && bucket) return `${ep.replace(/\/+$/, '')}/${bucket}/${key}`

    // Last resort: just the key (caller can handle it)
    return key
}

export function saveState(key, value) {
    localStorage.setItem(key, JSON.stringify(value))
}
export function loadState(key) {
    const v = localStorage.getItem(key)
    try { return v ? JSON.parse(v) : null } catch { return null }
}
