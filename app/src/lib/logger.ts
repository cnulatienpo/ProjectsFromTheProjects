type Level = 'debug' | 'info' | 'warn' | 'error'
type Fields = Record<string, unknown>

const isProd =
    typeof window !== 'undefined' &&
    /github\.io$/.test(window.location.hostname)

const PROD_API = import.meta.env.VITE_PROD_API || ''
const ENDPOINT = '/log' // same-origin in dev (proxy), absolute in prod

const seen = new Map<string, number>()
const TTL = 5_000 // 5s

function keyOf(level: Level, msg: string) {
    return `${level}:${msg.slice(0, 140)}`
}

async function sendRemote(payload: object) {
    try {
        const base = isProd ? PROD_API : ''
        await fetch(`${base}${ENDPOINT}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
    } catch {
        /* swallow — logging must not crash the app */
    }
}

function write(level: Level, msg: string, fields?: Fields) {
    const ts = new Date().toISOString()
    const k = keyOf(level, msg)
    const last = seen.get(k) || 0
    const now = Date.now()
    if (now - last < TTL) return
    seen.set(k, now)

    const line = { ts, level, msg, ...fields }

    // console
    const args = [`[${level.toUpperCase()}]`, msg, fields || '']
    if (level === 'error') console.error(...args)
    else if (level === 'warn') console.warn(...args)
    else if (level === 'debug') console.debug(...args)
    else console.log(...args)

    // remote (only for warn/error, and only if prod or explicitly enabled)
    const remote = (fields?.remote ?? undefined)
    const shouldSend =
        level !== 'debug' &&
        (isProd || remote === true) &&
        remote !== false

    if (shouldSend) void sendRemote(line)
}

export const log = {
    debug: (msg: string, fields?: Fields) => write('debug', msg, fields),
    info: (msg: string, fields?: Fields) => write('info', msg, fields),
    warn: (msg: string, fields?: Fields) => write('warn', msg, fields),
    error: (msg: string, fields?: Fields) => write('error', msg, fields),
}

// Auto-wire global error handlers once
let wired = false
export function wireGlobalLogging(appVersion = 'dev') {
    if (wired) return
    wired = true

    window.addEventListener('error', (e) => {
        log.error('unhandled_error', {
            error: String((e as ErrorEvent).error || (e as ErrorEvent).message || 'unknown'),
            stack: ((e as ErrorEvent).error && ((e as ErrorEvent).error as Error).stack) || undefined,
            href: location.href,
            v: appVersion,
            remote: true
        })
    })
    window.addEventListener('unhandledrejection', (e) => {
        const reason = ((e as PromiseRejectionEvent).reason && String((e as PromiseRejectionEvent).reason)) || 'unknown'
        log.error('unhandled_rejection', {
            error: reason,
            stack: ((e as PromiseRejectionEvent).reason && (e as any).reason.stack) || undefined,
            href: location.href,
            v: appVersion,
            remote: true
        })
    })
}
