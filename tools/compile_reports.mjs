// tools/compile_reports.mjs
// Compiles your TypeScript report modules into server/report/*.js using esbuild.
// It searches common locations for the three files and builds whatever it finds.

import fs from 'fs';
import path from 'path';
import { build } from 'esbuild';

const OUT_DIR = path.resolve('server', 'report');
fs.mkdirSync(OUT_DIR, { recursive: true });

const CANDIDATES = [
  // common spots from your tree
  'reportPhrases.ts',
  'reportTypes.ts',
  'reportEvolve.ts',
  path.join('app', 'src', 'reportPhrases.ts'),
  path.join('app', 'src', 'reportTypes.ts'),
  path.join('app', 'src', 'reportEvolve.ts'),
  path.join('packages', 'shared', 'src', 'reportPhrases.ts'),
  path.join('packages', 'shared', 'src', 'reportTypes.ts'),
  path.join('packages', 'server', 'src', 'reportEvolve.ts'),
  // fallbacks you uploaded earlier
  'reportPhrases.ts',
  'reportTypes.ts',
  'reportEvolve.ts',
];

function existing(files) {
  const seen = new Set();
  const out = [];
  for (const f of files) {
    const abs = path.resolve(f);
    if (!seen.has(abs) && fs.existsSync(abs)) { seen.add(abs); out.push(abs); }
  }
  return out;
}

const inputs = existing(CANDIDATES);
if (!inputs.length) {
  console.warn('⚠️ No report TS files found. Keeping previous analyzer.');
  process.exit(0);
}

console.log('🛠️ compiling reports → server/report');
await build({
  entryPoints: inputs,
  outdir: OUT_DIR,
  format: 'esm',
  platform: 'node',
  sourcemap: false,
  bundle: false,
  target: ['node18'],
  loader: { '.ts': 'ts' },
});

console.log('✅ compiled:', inputs.map((p) => path.relative(process.cwd(), p)).join(', '));
