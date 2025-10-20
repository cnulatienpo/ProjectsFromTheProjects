#!/usr/bin/env bash
set -euo pipefail

echo "🔧 Quick Development Status Check"
echo "=================================="

# Start servers in background if not running
if ! pgrep -f "server/index.js" > /dev/null; then
    echo "🚀 Starting backend..."
    cd /workspaces/ProjectsFromTheProjects
    NODE_ENV=development nohup node server/index.js > /tmp/server.log 2>&1 &
    sleep 2
fi

if ! pgrep -f "vite.*5173" > /dev/null; then
    echo "🌐 Starting frontend..."
    cd /workspaces/ProjectsFromTheProjects/app
    nohup npm run dev > /tmp/vite.log 2>&1 &
    sleep 3
fi

echo ""
echo "📊 Server Status:"
ps aux | grep -E "(vite|server/index)" | grep -v grep || echo "❌ No servers running"

echo ""
echo "🔌 Port Check:"
ss -tlnp | grep -E ':(3002|5173)' || echo "❌ Dev ports not listening"

echo ""
echo "🧪 API Tests:"
echo -n "Backend health: "
curl -s http://127.0.0.1:3002/health 2>/dev/null || echo "❌ FAILED"

echo -n "Frontend status: "
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:5173/ 2>/dev/null || echo "❌ FAILED"

echo ""
echo ""
echo "📋 Access Points:"
echo "• Frontend: http://localhost:5173/"
echo "• Diagnostics: http://localhost:5173/diagnostics.html"
echo "• Backend API: http://localhost:3002/"

echo ""
echo "📄 Logs:"
echo "• Backend: tail -f /tmp/server.log"
echo "• Frontend: tail -f /tmp/vite.log"
