# Report Evolve

- Author in `app/src/ai/reportEvolve.ts`.
- Run `npm run emit:report-evolve` to sync.
- Server loads `server/generated/reportEvolve.js` automatically if present (falls back to built-in if missing).

## Usage

- On results screen, backend calls the evolver with user history and latest judge result.
- Only include the style report on the results screen; do not show it during the attempt.
