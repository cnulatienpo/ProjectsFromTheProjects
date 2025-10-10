#!/usr/bin/env bash
set -euo pipefail

# Infer repo name from git remote url (fallback to current directory name)
REPO_NAME="$(basename -s .git "$(git remote get-url origin 2>/dev/null || echo "$(basename "$PWD")")")"
[ -z "$REPO_NAME" ] && REPO_NAME="$(basename "$PWD")"

mkdir -p node_scripts
cat > node_scripts/write_vite_config.mjs <<'NODE'
import fs from 'node:fs'

const repo = process.env.REPO_NAME
const desired = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/${repo}/',
})
`

const candidates = ['vite.config.ts', 'vite.config.js']
for (const f of candidates) {
  if (fs.existsSync(f)) {
    const txt = fs.readFileSync(f, 'utf8')
    // naive replace of base and ensure react plugin line exists
    let out = txt
    if (!/plugin-react/.test(out)) {
      out = `import react from '@vitejs/plugin-react'\n` + out
      out = out.replace(/defineConfig\(\{/, "defineConfig({\n  plugins: [react()],")
    } else if (!/plugins:\s*\[.*react\(\).*]/s.test(out)) {
      out = out.replace(/defineConfig\(\{/, "defineConfig({\n  plugins: [react()],")
    }
    if (/base:/.test(out)) {
      out = out.replace(/base:\s*['"`][^'"`]+['"`]/, `base: '/${repo}/'`)
    } else {
      out = out.replace(/defineConfig\(\{/, `defineConfig({\n  base: '/${repo}/',`)
    }
    fs.writeFileSync(f, out, 'utf8')
    console.log(`[vite] patched ${f} with base='/${repo}/'`)
    process.exit(0)
  }
}

fs.writeFileSync('vite.config.ts', desired, 'utf8')
console.log('[vite] created vite.config.ts with base setting')
NODE

REPO_NAME="$REPO_NAME" node node_scripts/write_vite_config.mjs
