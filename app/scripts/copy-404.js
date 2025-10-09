import fs from 'fs'
import path from 'path'
const dist = path.resolve('dist')
const src = path.join(dist, 'index.html')
const dst = path.join(dist, '404.html')
if (fs.existsSync(src)) {
    fs.copyFileSync(src, dst)
    console.log('Copied 404.html for SPA fallback')
}
