#!/usr/bin/env bash
set -euo pipefail

if [ ! -f .entry.env ]; then
  echo "Run scripts/10_fix_entry.sh first." >&2
  exit 1
fi
source .entry.env

if [ ! -f index.html ]; then
  echo "Creating minimal index.html"
  cat > index.html <<'HTML'
<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Projects From The Projects</title>
  </head>
  <body>
    <div id="root"></div>
    <!-- vite entry below -->
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
HTML
fi

# Ensure #root exists
if ! grep -q '<div[^>]*id="root"' index.html; then
  echo "Adding <div id=\"root\"></div> to index.html"
  perl -0777 -pe 's#</body>#  <div id="root"></div>\n  </body>#s' -i index.html
fi

# Replace the entry script to point to the detected ENTRY_FILE
ENTRY_ESC=$(printf '%s\n' "$ENTRY_FILE" | sed 's/[.[\*^$(){}+?|/]/\\&/g')
if grep -q '<script[^>]*type="module"[^>]*src="' index.html; then
  perl -0777 -pe "s#<script[^>]*type=\"module\"[^>]*src=\"[^\"]+\"[^>]*></script>#<script type=\"module\" src=\"/$ENTRY_ESC\"></script>#s" -i index.html
else
  echo "Adding entry script tag to index.html"
  perl -0777 -pe "s#</body>#  <script type=\"module\" src=\"/$ENTRY_ESC\"></script>\n  </body>#s" -i index.html
fi

echo "index.html patched to use /$ENTRY_FILE"
