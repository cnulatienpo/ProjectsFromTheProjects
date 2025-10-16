import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';

const PORT = 4173; // vite preview
const BASE = process.env.VITE_PAGES_BASE || '/'; // should match vite.config base
const routes = ['/', '/sigil', '/goodword', '/cut'];

function wait(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

async function startPreview() {
  return new Promise<{ proc: ReturnType<typeof spawn>; url: string }>(async (res) => {
    const proc = spawn('npm', ['run', 'preview'], { stdio: 'pipe', shell: true });
    const url = `http://localhost:${PORT}${BASE}`;
    await wait(1000);
    res({ proc, url });
  });
}

function joinUrl(base: string, path: string) {
  const b = base.endsWith('/') ? base : base + '/';
  const p = path.startsWith('/') ? path.slice(1) : path;
  return b + p;
}

(async () => {
  const { proc, url } = await startPreview();

  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const outDir = 'screenshots';
  await mkdir(outDir, { recursive: true });

  for (const r of routes) {
    try {
      const target = joinUrl(url, r);
      await page.goto(target, { waitUntil: 'networkidle' });
      await page.waitForTimeout(500);
      const name = r === '/' ? 'home' : r.replace(/\//g, '_').replace(/^_/, '');
      await page.screenshot({ path: `${outDir}/${ts}-${name}.png`, fullPage: true });
      console.log(`✔ saved ${outDir}/${ts}-${name}.png`);
    } catch (e) {
      console.warn(`! failed ${r}`, e);
    }
  }

  await browser.close();
  proc.kill('SIGINT');
})();
