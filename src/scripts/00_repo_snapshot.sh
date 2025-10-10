#!/usr/bin/env bash
set -euo pipefail

echo "=== Repo Snapshot ==="
echo "node:  $(node -v || true)"
echo "npm:   $(npm -v || true)"
echo "pwd:   $(pwd)"
echo "git remote:"
git remote -v || true
echo

echo "package.json name/version:"
node -e "try{let p=require('./package.json');console.log(p.name,p.version||'');}catch(e){console.log('no package.json')}" || true
echo

echo "vite.config.* present?"
ls -1 vite.config.* 2>/dev/null || echo "  (none)"
echo

echo "index.html check:"
if [ -f index.html ]; then
  grep -n '<div[^>]*id=\"root\"' -n index.html || echo "  MISSING: <div id=\"root\"></div>"
  grep -n '<script[^>]*type=\"module\"' index.html || echo "  MISSING: <script type=\"module\" src=\"/src/main.(t|j)sx\"></script>"
else
  echo "  index.html not found"
fi
echo

echo "Searching for entry candidates in src/:"
find src -maxdepth 1 -type f \( -name "main.tsx" -o -name "main.jsx" -o -name "index.tsx" -o -name "index.jsx" \) 2>/dev/null | sort || true
echo

echo "src tree (top-level):"
find src -maxdepth 2 -type f | sed 's,^,  ,g' | head -200
echo

echo "Looking for React Router:"
grep -R --line-number "react-router-dom" src || echo "  (router not found)"
echo

echo "Grepping for data-testid=\"game-root\":"
grep -R --line-number 'data-testid="game-root"' src || echo "  none"
echo

echo "Done."
