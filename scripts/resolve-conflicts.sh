#!/usr/bin/env sh
set -eu
PICK="${1:-auto}"
# Files we can safely pick "ours" for:
SAFE_PAT='(package-lock\\.json|yarn\\.lock|pnpm-lock\\.yaml|playwright-report/|coverage/|\\.playwright/)'

conflicted=$(git diff --name-only --diff-filter=U || true)
[ -z "$conflicted" ] && { echo "✅ No conflicts."; exit 0; }

for f in $conflicted; do
  if echo "$f" | grep -E "$SAFE_PAT" >/dev/null 2>&1; then
    case "$PICK" in
      --theirs) git checkout --theirs -- "$f";;
      --ours|auto|*) git checkout --ours -- "$f";;
    esac
    git add "$f"
    echo "Resolved (safe): $f"
  else
    echo "⚠️  Manual review needed: $f"
    echo "   → Open the file and remove conflict markers: <<<<<<< ======= >>>>>>>"
  fi
done

left=$(git diff --name-only --diff-filter=U || true)
[ -z "$left" ] && echo "🎉 Conflicts resolved for safe files. Stage & commit when done."
