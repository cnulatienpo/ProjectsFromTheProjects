# Report Types

- Author in `app/src/ai/reportTypes.ts` (TS, with comments).
- Emit with `npm run emit:report-types` → backend reads `game thingss/reportTypes.json`.

## API

- `GET /report-types` → IDs
- `GET /report-types/default` → the default type
- `GET /report-types/:id` → full definition

Typical fields:
- id
- name
- default?: boolean
- sections: string[]
- includesStyle?: boolean
- notes?: string[]
