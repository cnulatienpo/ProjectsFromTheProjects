export async function presignAndUpload({ file, key, presignBase = '' }) {
    const base = presignBase || ''
    const res = await fetch(`${base}/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, contentType: file.type || 'application/octet-stream' })
    })
    if (!res.ok) throw new Error('presign_failed')
    const { url } = await res.json()

    const put = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': file.type || 'application/octet-stream' },
        body: file
    })
    if (!put.ok) throw new Error('upload_failed')
    return { key }
}
