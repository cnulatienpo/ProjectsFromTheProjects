# Influence Catalog

- **Source of truth:** `app/src/ai/influenceCatalog.ts`
- **Build step:** `npm run emit:influences` → outputs `game thingss/influences.json`
- **Backend:** will read the JSON (loader added later)

Judge endpoint: `POST /api/judge { id, response, score? } → { score, xpDelta, feedback[], tags[], style }`

Rules live in `game thingss/influences.json` (emit from TS via `npm run emit:influences`).

## Tests
- Run `cd server && npm i && npm run test` to execute `reportEvolve.test.ts`.
- The test checks that feedback evolves (no repeated tags, actionable "Next:" closer).
