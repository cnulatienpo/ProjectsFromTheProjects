#!/usr/bin/env bash
set -euo pipefail

mkdir -p .backup_main
if [ -f src/main.tsx ]; then cp -n src/main.tsx .backup_main/main.tsx || true; fi
if [ -f src/main.jsx ]; then cp -n src/main.jsx .backup_main/main.jsx || true; fi

# choose tsx if present; else create tsx
ENTRY="src/main.tsx"
[ -f src/main.jsx ] && ENTRY="src/main.jsx"

cat > "$ENTRY" <<'TSX'
import React from 'react'
import { createRoot } from 'react-dom/client'

const el = document.getElementById('root')
if (!el) throw new Error('Missing #root in index.html')

function Hardcoded() {
  return (
    <div style={{padding:20,fontFamily:'ui-sans-serif,system-ui'}}>
      <h1>HELLO FROM BUILD ✅</h1>
      <p>This bypasses App and Router. If you can see this on GitHub Pages, mount/index/base are OK.</p>
      <p>Next step is to reintroduce <code>App</code> gradually.</p>
    </div>
  )
}

createRoot(el).render(<Hardcoded />)
TSX

echo "Wrote $ENTRY to force-render a HELLO screen."
echo "Rebuild to test: npm run build && npx serve dist -l 4173"
