// Prefer the generated file; fall back to the built-in one.
import fs from 'fs'
import path from 'path'

const GEN = path.resolve('server/generated/reportEvolve.js')

export async function loadEvolver() {
    if (fs.existsSync(GEN)) {
        const mod = await import('file://' + GEN)
        // supports either named or default export
        const fn = mod.evolveReport || mod.default
        if (typeof fn === 'function') return fn
    }
    // fallback to the local implementation
    const fallback = await import('./reportEvolve.js')
    return fallback.evolveReport
}
