# Conflicts & Tests — Quick Playbook

## Merge conflicts
1) List: `scripts/list-conflicts.sh`
2) Auto-resolve safe files (lockfiles, reports): `scripts/resolve-conflicts.sh`
3) Manually fix app code: search for <<<<<<< ======= >>>>>>> and edit.

## Playwright stability
- Retries: 2 on CI, timeouts hardened.
- Avoid duplicate `data-testid` in the same file.
- Prefer role/label queries for accessibility when possible.

## Pre-merge checks
- `npm run test:ids` to spot duplicate test IDs.
- Ensure no conflict markers remain (CI guard).
