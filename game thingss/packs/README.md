# Packs JSONL Format

Each line in a `.jsonl` file is a single JSON object representing a game item.

**Required fields:**
- `id` (string)
- `title` (string)
- `input_type` (string)
- `prompt_html` (string)

**Optional fields:**
- `skill` (string or null)
- `unit` (string or null)
- `choices` (array of strings)
- `correct_index` (number)
- `min_words` (number or null)
- `tags` (array of strings)
- `next` (string or null)

**Example:**
```json
{"id":"grammar101-1","title":"Simple Sentence","input_type":"write","prompt_html":"Write a simple sentence.","skill":"grammar","tags":["grammar","basics"],"min_words":10}
{"id":"devices101-1","title":"Metaphor MCQ","input_type":"mcq","prompt_html":"Which is a metaphor?","choices":["He ran fast.","Her eyes were stars."],"correct_index":1,"tags":["devices"]}
```
