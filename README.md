# Projects From The Projects

First commit: hygiene + guardrails only.

## What’s here
- `.gitignore` to keep junk and bloat out
- `.gitattributes` for sane line endings and binary handling
- `.editorconfig` for consistent formatting
- `docs/REPO_HYGIENE.md` space policy + do/don’t
- `docs/LFS.md` when/why to use Git LFS
- `scripts/` cleaners and size checks
- `.github/workflows/size-guard.yml` blocks huge files

## First steps
1) Keep sources small and text-first.
2) If you need large media, read `docs/LFS.md`.
3) Run `scripts/size-check.[sh|ps1]` locally before big commits.

