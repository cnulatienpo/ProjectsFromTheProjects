# Projects From The Projects
First milestone: **Literary Deviousness** — fiction writing games.

## What’s in this repo
- Hygiene: `.gitignore`, `.gitattributes`, `.editorconfig`
- Governance: `LICENSE`, `CODEOWNERS`
- GitHub UX: issue + PR templates
- Docs: `docs/REPO_HYGIENE.md`, `docs/LFS.md`, `docs/DECISIONS.md`

## Local setup
- Node (if needed later): see `.nvmrc`
- Line endings: LF enforced via `.gitattributes` / `.editorconfig`

## Contributing (solo-friendly)
- Open an issue (Bug/Feature) from templates
- PRs require passing “Size Guard” (no >10MB files)

## Roadmap (short)
- /site shell → add game
- integrate writer-type themes

## Dev tips
- Make shell scripts executable: `chmod +x scripts/*.sh`
- If on Windows, use the `.ps1` versions.
- To verify the dev server stays free of CSP headers or service workers, run `bash tools/check_dev_csp.sh`.
- User progress is persisted in `server/db/data/`.

---
## GitHub Pages Deployment

After first push to main:
- Go to **Settings → Pages** and set Source to “Deploy from a branch”, branch to “gh-pages” (if not auto-detected).

Visit:
- Site: https://<user>.github.io/<repo>/

Local check before push:
```sh
npm run build && npx vite preview --open
```
---

## API smoke test

```sh
# start server
npm start

# health/version
curl -s http://localhost:3002/api/healthz
curl -s http://localhost:3002/api/version

# next item
curl -s http://localhost:3002/api/next

# submit a simple attempt (why)
printf '%s' '{"userId":"dev","itemId":"t-185","mode":"why","answer":"Short, sharp -> layered clauses to slow pace."}' \
| curl -sS -X POST http://localhost:3002/api/attempt -H 'content-type: application/json' --data-binary @- | jq .

# latest report
curl -s http://localhost:3002/api/reports/latest?userId=dev | jq .

# skip current item, then ask next
curl -s -X POST http://localhost:3002/api/skip -H 'content-type: application/json' -d '{"userId":"dev","itemId":"t-185","mode":"why"}'
curl -s http://localhost:3002/api/next
```
