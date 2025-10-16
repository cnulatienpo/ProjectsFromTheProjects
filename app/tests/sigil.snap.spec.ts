import { test, expect, request } from '@playwright/test'

const BACKEND = 'https://animated-carnival-v4g77qwxgvv3p5p5-3001.app.github.dev'

test('catalog + first lesson screenshots', async ({ page, baseURL, context }) => {
  // Get first lesson id from backend
  const api = await request.newContext()
  const cat = await api.get(`${BACKEND}/sigil/catalog`, { headers: { accept: 'application/json' } })
  expect(cat.ok()).toBeTruthy()
  const j = await cat.json()
  expect(Array.isArray(j.games)).toBeTruthy()
  const firstId = j.first || j.games[0]
  expect(firstId).toBeTruthy()

  // Catalog page
  await page.goto(`${baseURL}/sigil`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(500) // settle fonts
  await page.screenshot({ path: 'app/test-output/sigil-catalog.png', fullPage: true })

  // First lesson page
  await page.goto(`${baseURL}/sigil/${encodeURIComponent(firstId)}`, { waitUntil: 'networkidle' })
  await page.waitForSelector('textarea')
  await page.waitForTimeout(500)
  await page.screenshot({ path: `app/test-output/sigil-lesson-${firstId.replace(/[:/]/g,'_')}.png`, fullPage: true })
})
