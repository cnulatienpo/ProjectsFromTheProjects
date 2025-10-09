export async function getFeatures() {
    try {
        const r = await fetch('/features')
        if (!r.ok) throw new Error(String(r.status))
        return await r.json()
    } catch {
        return { catalog: false, bundleDriven: true, levelsBadges: true }
    }
}
