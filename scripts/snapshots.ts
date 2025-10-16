import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';

const BASE = process.env.PREVIEW_BASE ?? '/';
const routes = ['/', '/sigil', '/goodword', '/cut'];

function normalizeBasePath(base) {
  if (!base || base === '/') {
    return '';
  }
  const withSlash = base.startsWith('/') ? base : `/${base}`;
  return withSlash.endsWith('/') ? withSlash.slice(0, -1) : withSlash;
}

function buildUrl(origin, route) {
  if (BASE && BASE !== '/') {
    const basePath = normalizeBasePath(BASE);
    const routePath = route === '/' ? '' : route.replace(/^\/+/, '');
    const finalPath = route === '/' ? `${basePath}/` : `${basePath}/${routePath}`;
    return new URL(finalPath, origin).href;
  }
  return new URL(route, origin).href;
}

async function startPreview() {
  const preview = spawn('npm', ['run', 'preview'], {
    shell: true,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  preview.stdout.setEncoding('utf8');
  preview.stderr.setEncoding('utf8');

  let buffer = '';

  const baseUrl = await new Promise((resolve, reject) => {
    let timer;

    const onData = (chunk) => {
      process.stdout.write(chunk);
      buffer += chunk;
      const match = buffer.match(/Local:\s+(http:\/\/[^\s]+)/);
      if (match) {
        cleanup();
        resolve(match[1]);
      }
    };

    const onError = (chunk) => {
      process.stderr.write(chunk);
    };

    const onExit = (code) => {
      cleanup();
      reject(new Error(`vite preview exited early (code ${code ?? 0})`));
    };

    const cleanup = () => {
      clearTimeout(timer);
      preview.stdout.off('data', onData);
      preview.stderr.off('data', onError);
      preview.off('exit', onExit);
    };

    timer = setTimeout(() => {
      cleanup();
      reject(new Error('Timed out waiting for vite preview to start'));
    }, 20000);

    preview.stdout.on('data', onData);
    preview.stderr.on('data', onError);
    preview.on('exit', onExit);
  });

  return { preview, baseUrl };
}

async function main() {
  const { preview, baseUrl } = await startPreview();
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outDir = 'screenshots';
  await mkdir(outDir, { recursive: true });

  try {
    for (const route of routes) {
      const target = buildUrl(baseUrl, route);
      try {
        await page.goto(target, { waitUntil: 'networkidle' });
        await page.waitForTimeout(400);
        const name = route === '/' ? 'home' : route.replace(/\//g, '_').replace(/^_/, '');
        const file = `${outDir}/${timestamp}-${name}.png`;
        await page.screenshot({ path: file, fullPage: true });
        console.log(`Saved ${file}`);
      } catch (error) {
        console.warn(`Failed to capture ${route}:`, error);
      }
    }
  } finally {
    await browser.close();
    preview.kill('SIGINT');
    await new Promise((resolve) => {
      preview.once('exit', resolve);
    });
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
