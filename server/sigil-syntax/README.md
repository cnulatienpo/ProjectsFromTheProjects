# Sigil_&_Syntax (server namespace)

Server modules for the Sigil_&_Syntax game.

- Display name: **Sigil_&_Syntax**
- Code slug: `sigil-syntax`
- JSON inputs live in `game thingss/sigil-syntax/` (emitted via scripts in `tools/`)

Judgment and loaders consume the generated JSON files; if they are missing we fall back to the TypeScript sources in
`app/src/ai/sigil-syntax/`.

The style analyzer (`styleReport.js`) powers the `/style-report` route and the evolver loader prefers
`server/generated/reportEvolve.js` when present.
