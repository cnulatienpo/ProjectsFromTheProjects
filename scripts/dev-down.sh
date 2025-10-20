#!/usr/bin/env bash
set -euo pipefail
[ -f /tmp/vite.pid ] && kill $(cat /tmp/vite.pid) 2>/dev/null || true
[ -f /tmp/server.pid ] && kill $(cat /tmp/server.pid) 2>/dev/null || true
pkill -f "node.*server/index.js" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true
npx kill-port 3001 5173 >/dev/null 2>&1 || true
echo "✅ Stopped dev servers on 3001 and 5173."
