#!/usr/bin/env node
import { cp, mkdir, readFile, stat, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const appDir = path.join(projectRoot, 'app');
const distDir = path.join(appDir, 'dist');

async function exists(target) {
  try {
    await stat(target);
    return true;
  } catch {
    return false;
  }
}

async function resetDist() {
  await rm(distDir, { recursive: true, force: true });
  await mkdir(distDir, { recursive: true });
}

async function copyIfExists(source, destination) {
  if (await exists(source)) {
    await cp(source, destination, { recursive: true, force: true });
  }
}

async function build() {
  await resetDist();

  await copyIfExists(path.join(appDir, 'public'), distDir);
  await copyIfExists(path.join(appDir, 'assets'), path.join(distDir, 'assets'));

  const htmlSourcePath = path.join(appDir, 'index.html');
  if (await exists(htmlSourcePath)) {
    const originalHtml = await readFile(htmlSourcePath, 'utf8');
    const patchedHtml = originalHtml.replace(/src="\/src\//g, 'src="./src/');
    await writeFile(path.join(distDir, 'index.html'), patchedHtml, 'utf8');
    await writeFile(path.join(distDir, '404.html'), patchedHtml, 'utf8');
  }

  await copyIfExists(path.join(appDir, 'src'), path.join(distDir, 'src'));

  console.log('[offline-vite] build completed without external dependencies.');
}

build().catch((error) => {
  console.error('[offline-vite] build failed:', error);
  process.exitCode = 1;
});
