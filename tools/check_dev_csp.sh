#!/usr/bin/env bash

set -u

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
REPO_ROOT="$(cd -- "${SCRIPT_DIR}/.." && pwd -P)"

cd "${REPO_ROOT}" || exit 1

APP_DIR="app"

printf '== 1) What CSP does the 5173 document send? ==\n'
if command -v curl >/dev/null 2>&1; then
  if headers=$(curl -sI http://127.0.0.1:5173/ 2>/dev/null); then
    printf '%s\n' "${headers}" | grep -i '^[[:space:]]*http' || true
    if ! printf '%s\n' "${headers}" | grep -i '^content-security-policy:'; then
      printf '(no CSP header on 5173 — good)\n'
    fi
  else
    printf '(dev server not reachable on 5173 — start Vite to check headers)\n'
  fi
else
  printf '(curl not available to query dev server headers)\n'
fi

printf '\n== 2) Search HTML for meta CSP (http-equiv) ==\n'
if ! rg -n --no-heading -C 2 -i "<meta[^>]+http-equiv=['\"]content-security-policy['\"]" "${APP_DIR}"; then
  printf '(no meta CSP tags found)\n'
fi

printf '\n== 3) List potential service worker files/registration ==\n'
if ! rg -n --no-heading -C 2 -i \
  -e "navigator\\.serviceWorker\\.register" \
  -e "self\\.addEventListener\\(\\s*['\\\"](?:install|fetch)" \
  -e "(?:\\.service-worker\\.|sw\\.js|service-worker\\.js|sw\\.ts)" \
  "${APP_DIR}"; then
  printf '(no service worker registrations or files detected)\n'
fi

printf '\n== 4) If a meta CSP exists, show the exact tag ==\n'
if rg -n -i "<meta[^>]+http-equiv=['\"]content-security-policy['\"]" "${APP_DIR}" >/dev/null; then
  rg -n -i "<meta[^>]+http-equiv=['\"]content-security-policy['\"]" -N --no-heading "${APP_DIR}"
else
  printf '(no meta CSP tags to display)\n'
fi

printf '\n== 5) If a SW is registered, remind how to unregister (browser console) ==\n'
cat <<'TXT'
In the browser DevTools Console (on 5173), paste to nuke all service workers:
  navigator.serviceWorker?.getRegistrations?.().then(rs => Promise.all(rs.map(r => r.unregister()))).then(() => caches?.keys?.().then(k => k.forEach(caches.delete)));

Then HARD reload (Ctrl–Shift–R) the 5173 page.

If meta CSP is found in app/index.html, remove or wrap it in PROD only, e.g.:

  <!-- #if PROD -->
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; ...">
  <!-- #endif -->

For dev, 5173 should have **no** CSP.
TXT
