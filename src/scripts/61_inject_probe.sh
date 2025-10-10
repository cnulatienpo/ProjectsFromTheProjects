#!/usr/bin/env bash
set -euo pipefail

mkdir -p src

# 1) Make a tiny runtime probe (no imports, no bundler needed)
cat > public/debug-probe.js <<'JS'
(function(){
  try {
    const banner = document.createElement('div');
    banner.id = 'LD_PROBE_BANNER';
    banner.style = 'position:fixed;top:0;left:0;right:0;padding:8px 12px;background:#111;color:#0f0;font:14px/1.4 ui-monospace,monospace;z-index:99999';
    banner.textContent = 'LD PROBE: index.html loaded ✓';
    document.body.prepend(banner);

    window.addEventListener('error', (e) => {
      const box = document.createElement('pre');
      box.style = 'white-space:pre-wrap;padding:8px 12px;background:#200;color:#f88;margin:0;border-top:1px solid #400';
      box.textContent = 'Runtime Error: ' + e.message + '\n' + (e.error && e.error.stack || '');
      banner.after(box);
    });
    window.addEventListener('unhandledrejection', (e) => {
      const box = document.createElement('pre');
      box.style = 'white-space:pre-wrap;padding:8px 12px;background:#220;color:#ff8;margin:0;border-top:1px solid #440';
      box.textContent = 'Unhandled Promise Rejection: ' + (e.reason && (e.reason.message || e.reason)) + '\n' + (e.reason && e.reason.stack || '');
      banner.after(box);
    });
  } catch (_) {}
})();
JS

# 2) Ensure index.html exists and references the probe and the real entry.
if [ ! -f index.html ]; then
  cat > index.html <<'HTML'
<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Projects From The Projects</title>
  </head>
  <body>
    <div id="root"></div>
    <script src="/debug-probe.js"></script>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
HTML
else
  # Inject the probe before the Vite entry (if not present)
  if ! grep -q 'debug-probe.js' index.html; then
    perl -0777 -pe 's#(<script[^>]*type="module"[^>]*src="[^"]+"></script>)#<script src="/debug-probe.js"></script>\n\1#s' -i index.html
  fi
fi

echo "Injected runtime probe. Rebuild and open the site; a green banner should appear at the top."
