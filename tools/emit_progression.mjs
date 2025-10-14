import fs from 'fs'
import path from 'path'

function sanitizeTS(tsText) {
    return tsText
        .replace(/^import.*$/gm, '')
        .replace(/^export\s+type.*$/gm, '')
        .replace(/^export\s+default\s*/gm, '')
        .replace(/^export\s+const\s+\w+\s*=\s*/gm, '')
        .replace(/\s+as\s+const\s*;?/g, '')
        .replace(/;$/gm, '')
        .trim()
}

function parseTSFile(tsPath, name) {
    const raw = fs.readFileSync(tsPath, 'utf8')
    const sanitized = sanitizeTS(raw)
    let json
    try {
        json = JSON.parse(sanitized)
    } catch (e) {
        console.warn(`[emit_progression] Failed to parse ${name}: ${e.message}`)
        console.warn(sanitized.slice(0, 200))
        return null
    }
    return json
}

const levelsPath = process.env.LEVELS_TS || path.resolve('app/src/progression/levels.ts')
const badgesPath = process.env.BADGES_TS || path.resolve('app/src/progression/badges.ts')

const levels = parseTSFile(levelsPath, 'levels.ts')
const badges = parseTSFile(badgesPath, 'badges.ts')

const outDir = path.resolve('game thingss', 'sigil-syntax')
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })

if (levels) {
    fs.writeFileSync(path.join(outDir, 'levels.json'), JSON.stringify(levels, null, 2))
    console.log(`[emit_progression] Wrote levels.json (${Array.isArray(levels) ? levels.length : 0} levels)`)
}
if (badges) {
    fs.writeFileSync(path.join(outDir, 'badges.json'), JSON.stringify(badges, null, 2))
    console.log(`[emit_progression] Wrote badges.json (${Array.isArray(badges) ? badges.length : 0} badges)`)
}
if (!levels || !badges) {
    console.warn('[emit_progression] Warning: Some progression files failed to emit. See above.')
}
