// Copies index.html -> 404.html for SPA fallback (GitHub Pages).
// Works whether you ran the build from root or from /app.

import fs from 'fs'
import path from 'path'
import url from 'url'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

// Candidate dist folders in priority order
const candidates = [
    path.resolve(__dirname, '..', 'app', 'dist'),
    path.resolve(__dirname, '..', 'dist')
]

const dist = candidates.find(d => fs.existsSync(path.join(d, 'index.html')))
if (!dist) {
    console.error('❌ copy-404: could not find dist folder with index.html in:', candidates)
    process.exit(1)
}

const src = path.join(dist, 'index.html')
const dst = path.join(dist, '404.html')

fs.copyFileSync(src, dst)
console.log(`✅ copy-404: ${path.relative(process.cwd(), src)} → ${path.relative(process.cwd(), dst)}`)
