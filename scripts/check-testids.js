#!/usr/bin/env node
/**
 * Scans source files for duplicate data-testid values within the same file,
 * which often causes Playwright locator collisions.
 */
const fs = require('fs');
const path = require('path');

const roots = ['src', 'app', 'site', 'public']; // adjust as your tree evolves
const exts  = new Set(['.tsx', '.ts', '.jsx', '.js', '.html', '.svelte', '.vue']);

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir)) {
    const p = path.join(dir, entry);
    const st = fs.statSync(p);
    if (st.isDirectory()) { walk(p, files); }
    else files.push(p);
  }
  return files;
}

function scanFile(file) {
  const text = fs.readFileSync(file, 'utf8');
  const re = /data-testid=["'`]([^"'`]+)["'`]/g;
  const seen = new Map();
  let m;
  while ((m = re.exec(text))) {
    const val = m[1];
    seen.set(val, (seen.get(val) || 0) + 1);
  }
  const dups = [...seen.entries()].filter(([, n]) => n > 1);
  if (dups.length) {
    console.log(`\n${file}`);
    for (const [val, n] of dups) console.log(`  • "${val}" appears ${n}×`);
    return 1;
  }
  return 0;
}

let rc = 0;
for (const root of roots) {
  if (!fs.existsSync(root)) continue;
  const files = walk(root).filter(f => exts.has(path.extname(f)));
  for (const f of files) rc |= scanFile(f);
}
if (rc) {
  console.error('\n❌ Duplicate data-testid values found in the same file. Make them unique (e.g., add -secondary, -sidebar).');
  process.exit(1);
} else {
  console.log('✅ No duplicate data-testid values detected within files.');
}
