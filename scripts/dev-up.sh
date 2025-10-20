#!/usr/bin/env bash
set -euo pipefail
ROOT="/workspaces/ProjectsFromTheProjects"
APP="$ROOT/app"

# Kill anything stale
npx kill-port 3001 5173 >/dev/null 2>&1 || true
pkill -f "node.*server/index.js" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true

# Ensure vite dev script binds to 0.0.0.0:5173 (so Ports forwarding works)
if [ -f "$APP/package.json" ]; then
  node -e '
    const fs=require("fs"); const p=process.argv[1];
    const j=JSON.parse(fs.readFileSync(p,"utf8"));
    j.scripts=j.scripts||{};
    j.scripts.dev="vite --host 0.0.0.0 --port 5173 --strictPort";
    fs.writeFileSync(p, JSON.stringify(j,null,2));
    console.log("✅ app/package.json scripts.dev =", j.scripts.dev);
  ' "$APP/package.json"
fi

# Start backend (dev) in the background (nohup)
cd "$ROOT"
( NODE_ENV=development nohup npm run dev:server > /tmp/server.out 2>&1 & echo $! > /tmp/server.pid )
sleep 0.7

# Start Vite (bind 0.0.0.0) in the background (nohup)
cd "$APP"
( nohup npm run dev > /tmp/vite.out 2>&1 & echo $! > /tmp/vite.pid )
sleep 1.0

cd "$ROOT"
echo "🧪 Health checks:"
printf " 5173: "; curl -sI http://127.0.0.1:5173/ | head -n1 || true
printf " 3001: "; curl -sI http://127.0.0.1:3001/ | head -n1 || true

echo "📄 Logs: tail -f /tmp/vite.out /tmp/server.out"
echo "🛑 Stop: scripts/dev-down.sh"
