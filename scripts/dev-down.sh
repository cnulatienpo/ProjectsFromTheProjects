#!/usr/bin/env bash
set -euo pipefail

echo "🛑 Stopping development servers..."

# Kill by PID files first
[ -f /tmp/vite.pid ] && kill $(cat /tmp/vite.pid) 2>/dev/null && rm /tmp/vite.pid || true
[ -f /tmp/server.pid ] && kill $(cat /tmp/server.pid) 2>/dev/null && rm /tmp/server.pid || true

# Kill by process name
pkill -f "node.*server/index.js" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true

# Force kill ports (more aggressive)
fuser -k 3001/tcp 2>/dev/null || true
fuser -k 3002/tcp 2>/dev/null || true
fuser -k 5173/tcp 2>/dev/null || true

# Wait for ports to be released
sleep 2

# Verify ports are free
echo "🔍 Verifying ports are free:"
PORTS_USED=$(ss -tlnp | grep -E ':(3001|3002|5173)' | wc -l)
if [ "$PORTS_USED" -gt 0 ]; then
  echo "⚠️  Some ports still in use:"
  ss -tlnp | grep -E ':(3001|3002|5173)'
else
  echo "✅ All dev ports (3001, 3002, 5173) are free"
fi
