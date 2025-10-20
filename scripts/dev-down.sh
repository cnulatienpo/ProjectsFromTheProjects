#!/usr/bin/env bash
set -euo pipefail
[ -f /tmp/vite.pid ] && kill $(cat /tmp/vite.pid) 2>/dev/null || true
[ -f /tmp/server.pid ] && kill $(cat /tmp/server.pid) 2>/dev/null || true
pkill -f "node.*server/index.js" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true
fuser -k 3001/tcp 2>/dev/null || true
fuser -k 3002/tcp 2>/dev/null || true
fuser -k 5173/tcp 2>/dev/null || true
echo "✅ Stopped dev servers on 3002 and 5173."
