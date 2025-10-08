#!/usr/bin/env sh
# Copy to .git/hooks/pre-commit and chmod +x to enable.
scripts/size-check.sh || exit $?

