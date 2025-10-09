# Content Bundle Format

The bundle is a single JSON file containing all game items and lessons.

```json
{
  "version": 1,
  "generated_at": "ISO8601 timestamp",
  "items": [
    {
      "id": "",
      "title": "",
      "input_type": "",
      "prompt_html": "",
      "skill": null,
      "unit": null,
      "choices": [],
      "correct_index": 0,
      "min_words": null,
      "tags": [],
      "next": null
    }
    // ...more items
  ],
  "lessons": [
    {
      "lesson_id": "",
      "ord": 0,
      "title": "",
      "body": "",
      "skills": []
    }
    // ...more lessons
  ],
  "skills_map": {
    // passthrough from foundation_skill_map.json if present
  }
}
```

## How to check it

Run server + Vite.

Open `/bundle` to confirm version/counts.

Open `/game/run/&lt;some-id&gt;` to test rendering.
