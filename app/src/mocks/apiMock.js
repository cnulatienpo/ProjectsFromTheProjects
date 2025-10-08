export function installApiMock() {
    const demoNext = { level: 'grammar', prompt: 'Write a sentence.' }
    const demoAttempt = { success: true, score: 42 }
    const origFetch = window.fetch
    window.fetch = async (url, opts) => {
        if (url.endsWith('/api/next')) {
            return new Response(JSON.stringify(demoNext), { status: 200 })
        }
        if (url.endsWith('/api/attempt')) {
            return new Response(JSON.stringify(demoAttempt), { status: 200 })
        }
        return origFetch(url, opts)
    }
}
