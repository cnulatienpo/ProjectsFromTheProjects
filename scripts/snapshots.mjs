import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { chromium } from '@playwright/test';

const PORT = 4173;
const BASE = process.env.VITE_PAGES_BASE || '/';
const ROUTES = ['/', '/sigil', '/goodword', '/cut'];

const wait = (ms) => new Promise(r => setTimeout(r, ms));
const joinUrl = (base, path) => (base.endsWith('/')?base:base+'/') + (path.startsWith('/')?path.slice(1):path);

async function startPreview() {
  const proc = spawn('npm', ['run', 'preview'], { stdio: 'inherit', shell: true });
  await wait(900);
  return { proc, url: `http://localhost:${PORT}${BASE}` };
}

(async () => {
  const { proc, url } = await startPreview();
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }});
  const page = await ctx.newPage();

  // Make shots succeed even if API is down
  await page.route('**/sigil/catalog', async (route) => {
    try {
      const res = await route.fetch();
      return route.fulfill({ response: res });
    } catch {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true, items: [] })
      });
    }
  });

  const ts = new Date().toISOString().replace(/[:.]/g,'-');
  await mkdir('screenshots', { recursive: true });

  for (const r of ROUTES) {
    const target = joinUrl(url, r);
    await page.goto(target, { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);
    const name = r === '/' ? 'home' : r.replace(/\//g,'_').replace(/^_/, '');
    await page.screenshot({ path: `screenshots/${ts}-${name}.png`, fullPage: true });
    console.log(`✔ screenshots/${ts}-${name}.png`);
  }

  await browser.close();
  proc.kill('SIGINT');
})();
