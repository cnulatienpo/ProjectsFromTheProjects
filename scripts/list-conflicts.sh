#!/usr/bin/env sh
set -eu
echo "🔎 Listing merge conflicts..."
git diff --name-only --diff-filter=U
echo
echo "Tip: run scripts/resolve-conflicts.sh --ours or --theirs for lockfiles and generated outputs."
