#!/usr/bin/env bash
set -euo pipefail

if [ ! -f package.json ]; then
  echo "No package.json found. Run inside project root." >&2
  exit 1
fi

# Make sure deps for React + Router exist (safe re-install)
if ! grep -q '"react-router-dom"' package.json; then
  npm i react-router-dom
fi
if ! grep -q '"react-dom"' package.json; then
  npm i react react-dom
fi
if ! grep -q '"@vitejs/plugin-react"' package.json; then
  npm i -D @vitejs/plugin-react
fi

echo "Installing deps..."
npm ci || npm i

echo "Building..."
npm run build

echo "Copying SPA fallback..."
cp -f dist/index.html dist/404.html || true

echo
echo "Local preview (use this to simulate Pages):"
npx --yes serve dist -l 4173 || true
