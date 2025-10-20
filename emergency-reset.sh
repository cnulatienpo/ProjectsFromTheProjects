#!/usr/bin/env bash
echo "🚨 EMERGENCY RESET - Starting from scratch"

# Kill everything
pkill -f vite 2>/dev/null || true
pkill -f "server/index" 2>/dev/null || true
sleep 2

# Start backend on a completely different port
cd /workspaces/ProjectsFromTheProjects
echo "Starting backend on port 4000..."
PORT=4000 NODE_ENV=development node server/index.js &
sleep 3

# Test backend directly
echo "Testing backend..."
curl -s http://127.0.0.1:4000/health || echo "Backend failed"

# Start frontend with proxy to new port
echo "Starting frontend..."
cd app
sed -i 's/3002/4000/g' vite.config.ts
npm run dev &
sleep 5

echo "Testing frontend..."
curl -s http://127.0.0.1:5173/ > /dev/null && echo "Frontend OK" || echo "Frontend failed"

echo "Done. Try http://localhost:5173/"
