# Repo Hygiene & Space Policy

Goal: keep the repo fast, light, and portable.

## Golden Rules
- Generated stuff stays out of git (builds, caches, reports).
- Secrets/env stay out of git (`.env`); share `./.env.example` only.
- Big binaries (images/video/audio > 5 MB) → prefer external storage or Git LFS.
- Check sizes before committing.

## Typical Sources vs. Outputs
- **Sources**: code, small SVGs, configs, docs, JSON fixtures.
- **Outputs (ignore)**: `dist/`, `build/`, `out/`, coverage, reports, `.cache/`, `.venv/`, `node_modules/`.

## Folder Conventions
- `src/` app/source code (text-first).
- `public/` small public assets (≤ 200 KB each).
- `assets/` WIP media; large files go LFS or external.
- `site/` is considered generated export → ignored by default.

## Size Budgets (soft)
- Single file soft cap: **5 MB** (warn), hard cap: **10 MB** (block).
- PR total added size soft cap: **50 MB**.

Use `scripts/size-check.*` before commits.

