// Converts a TypeScript influence catalog to JSON for the backend.
// Default input: app/src/ai/influenceCatalog.ts
// Output: game thingss/sigil-syntax/influences.json

import fs from 'fs'
import path from 'path'

const INPUT = process.env.INFLUENCES_TS || path.resolve('app/src/ai/influenceCatalog.ts')
const OUT_DIR = path.resolve('game thingss', 'sigil-syntax')
const OUT_FILE = path.join(OUT_DIR, 'influences.json')

function readFileSafe(p) {
    try { return fs.readFileSync(p, 'utf8') } catch (e) {
        console.error(`❌ Cannot read ${p}: ${e.message}`); process.exit(1)
    }
}

function sanitizeTsToJsonish(src) {
    // Remove import lines and type exports
    src = src
        .replace(/^\s*import[\s\S]*?from\s+['"][^'"]+['"];?\s*$/gm, '')
        .replace(/^\s*export\s+type[\s\S]*?;?\s*$/gm, '')

    // Strip "as const" and inline type annotations like ": Foo"
    src = src.replace(/\sas const\b/g, '')
        .replace(/: \w+(\[\])?/g, '') // simple cases

    // Remove "export default" or "export const X ="
    src = src.replace(/^\s*export\s+default\s+/m, '')
        .replace(/^\s*export\s+const\s+\w+\s*=\s*/m, '')

    // If it exports an object like { influences:[...] }, try to grab .influences
    // Otherwise assume it's a top-level array.
    const trimmed = src.trim()
    if (trimmed.startsWith('{')) {
        // crude extract of "influences: [...]"
        const m = trimmed.match(/influences\s*:\s*(\[[\s\S]*\])/)
        if (m) return m[1]
    }
    return trimmed
}

function toJson(text) {
    // Ensure it looks like an array; if not, wrap brackets best-effort
    let t = text.trim()
    if (!t.startsWith('[')) {
        // try to find the first '[' and last ']'
        const a = t.indexOf('['), b = t.lastIndexOf(']')
        if (a !== -1 && b !== -1 && b > a) t = t.slice(a, b + 1)
    }
    try { return JSON.parse(t) } catch (e) {
        console.error('❌ Failed to parse JSON from sanitized TS.')
        console.error('--- snippet ---')
        console.error(t.slice(0, 400))
        console.error('--------------')
        console.error(e.message)
        process.exit(1)
    }
}

function validateInfluences(arr) {
    if (!Array.isArray(arr)) {
        console.error('❌ Influences must be an array.'); process.exit(1)
    }
    let ok = 0, warn = 0
    for (const it of arr) {
        if (!it || typeof it !== 'object') { warn++; continue }
        if (!it.id || typeof it.id !== 'string') { warn++; continue }
        // Common fields we expect (not strictly required so authoring can evolve)
        // id, when, weight, template/text, xp_bonus?
        ok++
    }
    if (warn) console.warn(`⚠️  ${warn} item(s) looked odd; proceeding anyway.`)
    return arr
}

function ensureDir(p) { fs.mkdirSync(p, { recursive: true }) }

function main() {
    const src = readFileSafe(INPUT)
    const jsonish = sanitizeTsToJsonish(src)
    const data = validateInfluences(toJson(jsonish))
    ensureDir(OUT_DIR)
    fs.writeFileSync(OUT_FILE, JSON.stringify(data, null, 2), 'utf8')
    console.log(`✅ Wrote ${OUT_FILE} (${data.length} influences)`)
}

main()
