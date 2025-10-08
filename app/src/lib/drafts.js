import { presignAndUpload } from './upload.js'

const PRESIGN_BASE = 'http://localhost:8787'

export async function saveDraftToCloud({ lessonId, text }) {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const file = new File([blob], `${lessonId}.txt`, { type: blob.type })
    const key = `drafts/${lessonId}/${Date.now()}-${lessonId}.txt`
    await presignAndUpload({ file, key, presignBase: PRESIGN_BASE })
    localStorage.setItem(`ld:${lessonId}:lastKey`, key)
    return key
}

export async function loadLastDraftFromCloud({ lessonId }) {
    const key = localStorage.getItem(`ld:${lessonId}:lastKey`)
    if (!key) throw new Error('no_cloud_draft')
    const res = await fetch(`${PRESIGN_BASE}/sign-get`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key })
    })
    if (!res.ok) throw new Error('presign_get_failed')
    const { url } = await res.json()
    const got = await fetch(url)
    if (!got.ok) throw new Error('download_failed')
    return await got.text()
}
