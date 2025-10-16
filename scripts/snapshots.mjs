import { spawn } from 'node:child_process'
import { mkdir } from 'node:fs/promises'
import { chromium } from '@playwright/test'

const PORT = 4173 // vite preview
const BASE = process.env.VITE_PAGES_BASE || '/' // must match vite.config base
const ROUTES = ['/', '/sigil', '/goodword', '/cut']

const wait = (ms) => new Promise((r) => setTimeout(r, ms))

const joinUrl = (base, path) => {
  const b = base.endsWith('/') ? base : base + '/'
  const p = path.startsWith('/') ? path.slice(1) : path
  return b + p
}

async function startPreview() {
  const proc = spawn('npm', ['run', 'preview'], { stdio: 'inherit', shell: true })
  await wait(900) // small boot delay
  return { proc, url: `http://localhost:${PORT}${BASE}` }
}

;(async () => {
  const { proc, url } = await startPreview()
  const browser = await chromium.launch()
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }})
  const page = await ctx.newPage()

  // If preview can’t reach the real backend, stub critical endpoints so pages render.
  await page.route('**/sigil/catalog', async (route) => {
    try {
      // Try passthrough first—if backend is reachable, use it
      const res = await route.fetch()
      return route.fulfill({ response: res })
    } catch {
      // Otherwise, mock minimal JSON so UI renders for screenshots
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true, items: [] }),
      })
    }
  })

  const ts = new Date().toISOString().replace(/[:.]/g, '-')
  await mkdir('screenshots', { recursive: true })

  for (const r of ROUTES) {
    const target = joinUrl(url, r)
    try {
      await page.goto(target, { waitUntil: 'networkidle' })
      await page.waitForTimeout(600)
      const name = r === '/' ? 'home' : r.replace(/\//g, '_').replace(/^_/, '')
      await page.screenshot({ path: `screenshots/${ts}-${name}.png`, fullPage: true })
      console.log(`✔ saved screenshots/${ts}-${name}.png`)
    } catch (e) {
      console.warn(`! failed ${r}`, e)
    }
  }

  await browser.close()
  proc.kill('SIGINT')
})()
