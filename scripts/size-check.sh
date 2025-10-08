#!/usr/bin/env sh
set -eu

SOFT=5242880    # 5 MB
HARD=10485760   # 10 MB
RED=\\033[31m
YEL=\\033[33m
GRN=\\033[32m
RST=\\033[0m

echo "Scanning working tree for large files…"

BLOCK=0
WARN=0

# List tracked & untracked (except ignored)
FILES=$(git ls-files; git ls-files --others --exclude-standard)
for f in $FILES; do
  [ -f "$f" ] || continue
  sz=$(wc -c < "$f" | tr -d ' ')
  if [ "$sz" -ge "$HARD" ]; then
    printf "${RED}BLOCK:${RST} %s (%.2f MB) exceeds hard cap (10 MB)\n" "$f" "$(echo "$sz/1048576" | bc -l)"
    BLOCK=1
  elif [ "$sz" -ge "$SOFT" ]; then
    printf "${YEL}WARN:${RST}  %s (%.2f MB) over soft cap (5 MB)\n" "$f" "$(echo "$sz/1048576" | bc -l)"
    WARN=1
  fi
done

[ "$BLOCK" -eq 1 ] && { echo "❌ Block: reduce file sizes or use LFS."; exit 2; }
[ "$WARN" -eq 1 ] && echo "⚠️  Warn: consider shrinking or LFS."
echo "✅ Size check passed."

