# Report Phrases

- Author phrases in `app/src/ai/reportPhrases.ts`.
- Emit with `npm run emit:phrases` → backend reads `game thingss/sigil-syntax/reportPhrases.json`.

## Shape


Shape summary:

- `closers`: buckets `low`, `mid`, `high` (arrays of strings).
- `tags`: record keyed by tag → array of strings.
- `praise`: fallback praise strings.
- `generic`: neutral fallbacks.

Tags correspond to what `/api/judge` returns in `tags[]`.
