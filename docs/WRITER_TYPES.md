# Writer Types

- Author in `game thingss/writer_type_custom_elements.jsonl` (one JSON object per line).
- Emit with `npm run emit:writer-types` (script: `"emit:writer-types": "node tools/emit_writer_types.mjs"`).

## Backend serves

- `GET /writer-types` → list of IDs
- `GET /writer-types/:id` → full element (fields: id, kind, label, html, rules, …)
- `GET /writer-types/all` → full array (for admin tools)

Frontend can fetch a type by ID to render custom UI, hints, or formatting.
