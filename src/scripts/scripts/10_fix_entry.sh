#!/usr/bin/env bash
set -euo pipefail

mkdir -p src

choose_entry() {
  for f in src/main.tsx src/main.jsx src/index.tsx src/index.jsx; do
    if [ -f "$f" ]; then echo "$f"; return; fi
  done
  echo ""  # none found
}

ENTRY="$(choose_entry)"

if [ -z "$ENTRY" ]; then
  echo "No entry found. Creating TypeScript entry at src/main.tsx and minimal App."
  cat > src/App.tsx <<'TSX'
import { HashRouter, Routes, Route } from 'react-router-dom'

function Home() {
  return <div style={{padding:16}}><h1>Literary Deviousness ✅</h1></div>
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </HashRouter>
  )
}
TSX

  cat > src/main.tsx <<'TSX'
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

const el = document.getElementById('root')
if (!el) throw new Error('Missing #root in index.html')

createRoot(el).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
TSX

  ENTRY="src/main.tsx"
else
  echo "Found entry: $ENTRY"
  # If App.* missing, create a tiny one but don't overwrite if present.
  if [ ! -f src/App.tsx ] && [ ! -f src/App.jsx ]; then
    echo "No App.* detected. Creating a minimal App.tsx"
    cat > src/App.tsx <<'TSX'
import { HashRouter, Routes, Route } from 'react-router-dom'

function Home() {
  return <div style={{padding:16}}><h1>Literary Deviousness ✅</h1></div>
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </HashRouter>
  )
}
TSX
  fi
fi

echo "ENTRY_FILE=$ENTRY" > .entry.env
echo "ENTRY resolved to: $ENTRY"
