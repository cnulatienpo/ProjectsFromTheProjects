# Content Bundle Format

The bundle is a single JSON file containing all game items and lessons.

- `version`: number.
- `generated_at`: ISO 8601 timestamp string.
- `items[]`: each item has `id`, `title`, `input_type`, `prompt_html`, optional `skill`/`unit`, optional choices/validation fields, tags, and optional `next` pointer.
- `lessons[]`: each lesson has `lesson_id`, `ord`, `title`, `body`, and related `skills` array.
- `skills_map`: optional passthrough from `foundation_skill_map.json`.

## How to check it

Run server + Vite.

Open `/bundle` to confirm version/counts.

Open `/game/run/&lt;some-id&gt;` to test rendering.
