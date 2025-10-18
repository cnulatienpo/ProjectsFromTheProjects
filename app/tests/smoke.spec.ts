import { test, expect } from '@playwright/test';

const BASE = process.env.PREVIEW_URL || 'http://localhost:5173';

test('smoke: health and catalog', async ({ page }) => {
  await page.goto(`${BASE}/_ui/smoke`, { waitUntil: 'networkidle' });
  const pre = page.locator('pre');
  await expect(pre).toContainText('"DEV": true', { timeout: 15000 });
  await expect(pre).toContainText('"ok": true'); // health ok
  // catalog exists or shows error; we at least want no crash:
  await expect(pre).toBeVisible();
});

test('screenshot: /sigil', async ({ page }) => {
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  // navigate via client routing to avoid deep-link preview 404s
  await page.evaluate(() => {
    window.history.pushState({}, '', '/sigil');
    window.dispatchEvent(new PopStateEvent('popstate'));
  });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(800); // settle
  await page.screenshot({ path: `screenshots/sigil.png`, fullPage: true });
});
