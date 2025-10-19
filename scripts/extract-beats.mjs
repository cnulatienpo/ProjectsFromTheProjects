import fs from 'node:fs';
import readline from 'node:readline';
import crypto from 'node:crypto';
import path from 'node:path';

const INPUT = path.resolve('labeled data/tweetrunk_renumbered.jsonl');
const OUT_DIR = path.resolve('game thingss/derived');

ensureDir(OUT_DIR);

const beatsByLesson = [];
const uniqueBeats = new Map();
const firstSeenOrder = [];
const beatFirstSeenIndex = new Map();
const counts = new Map();

const report = {
  parse_errors: [],
  long_ids: [],
  unknown_color_blocks: [],
  totals: { lessons: 0, lessons_with_beats: 0, unique_beats: 0, total_mentions: 0 }
};

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function stableHash(str) {
  return crypto.createHash('sha1').update(String(str)).digest('hex').slice(0, 10);
}

function slugifyTitle(s) {
  const cleaned = String(s)
    .toLowerCase()
    .trim()
    .replace(/["'`]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return cleaned || `auto-${stableHash(s)}`;
}

function titleCase(id) {
  return String(id)
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

function isColorMap(obj) {
  if (!obj || typeof obj !== 'object') return false;
  const values = Object.values(obj);
  if (!values.length) return false;
  return values.every((v) => typeof v === 'string' && /^#?[0-9a-f]{3,8}$/i.test(v));
}

function normBeatId(raw) {
  if (typeof raw !== 'string') return null;
  let value = raw.trim();
  if (!value) return null;
  const parts = value.split(':');
  if (
    parts.length === 2 &&
    (parts[0].toLowerCase() === 'beat' || parts[0].toLowerCase() === 'type')
  ) {
    value = parts[1];
  }
  value = value
    .toLowerCase()
    .trim()
    .replace(/[\/]/g, '-')
    .replace(/\s+/g, '-');
  return value || null;
}

function collectFromArray(arr, destSet) {
  for (const item of arr) {
    const id = normBeatId(item);
    if (id) destSet.add(id);
  }
}

function scanForBeats(obj, destSet) {
  if (typeof obj.beat === 'string') {
    const id = normBeatId(obj.beat);
    if (id) destSet.add(id);
  }
  if (Array.isArray(obj.beats)) collectFromArray(obj.beats, destSet);
  if (Array.isArray(obj.labels)) collectFromArray(obj.labels, destSet);
  if (Array.isArray(obj.tags)) collectFromArray(obj.tags, destSet);

  for (const [key, value] of Object.entries(obj)) {
    if (!value || typeof value !== 'object') continue;
    const lower = key.toLowerCase();
    if (['meta', 'metadata', 'annotation', 'annotations', 'props', 'extra', 'fields'].includes(lower)) {
      if (Array.isArray(value.beats)) collectFromArray(value.beats, destSet);
      if (Array.isArray(value.labels)) collectFromArray(value.labels, destSet);
      if (Array.isArray(value.tags)) collectFromArray(value.tags, destSet);
      if (typeof value.beat === 'string') {
        const id = normBeatId(value.beat);
        if (id) destSet.add(id);
      }
    }
  }
}

function scanForColors(obj) {
  const candidates = [];
  const stack = [obj];
  while (stack.length) {
    const current = stack.pop();
    if (!current || typeof current !== 'object') continue;
    if (isColorMap(current)) {
      candidates.push(current);
      continue;
    }
    for (const value of Object.values(current)) {
      if (value && typeof value === 'object') stack.push(value);
    }
  }

  const colorMap = {};
  for (const candidate of candidates.reverse()) {
    for (const [idRaw, colorRaw] of Object.entries(candidate)) {
      const id = normBeatId(idRaw);
      if (!id) continue;
      const color = String(colorRaw).startsWith('#') ? String(colorRaw) : `#${String(colorRaw)}`;
      if (!colorMap[id]) {
        colorMap[id] = color;
      }
    }
  }

  return Object.keys(colorMap).length ? colorMap : null;
}

async function main() {
  const rl = readline.createInterface({
    input: fs.createReadStream(INPUT, { encoding: 'utf8' }),
    crlfDelay: Infinity,
  });

  let lineIndex = 0;

  for await (const rawLine of rl) {
    lineIndex++;
    const line = rawLine.trim();
    if (!line) continue;

    let record;
    try {
      record = JSON.parse(line);
    } catch (error) {
      report.parse_errors.push({ line: lineIndex, error: String(error).slice(0, 160) });
      continue;
    }

    const lessonId =
      record.id ??
      record.lesson_id ??
      record.slug ??
      (record.title ? slugifyTitle(record.title) : `auto-${stableHash(`${lineIndex}:${line}`)}`);

    const beatSet = new Set();
    scanForBeats(record, beatSet);
    const beats = [...beatSet];

    const colorMap = scanForColors(record);

    const lessonIndex = beatsByLesson.length;
    const lessonEntry = {
      lessonId,
      index: lessonIndex,
      beats,
    };
    if (colorMap) lessonEntry.emoticonColor = colorMap;
    beatsByLesson.push(lessonEntry);

    if (beats.length) report.totals.lessons_with_beats++;

    for (const beat of beats) {
      if (beat.length > 40) {
        report.long_ids.push({ lessonId, beat, length: beat.length });
      }
      counts.set(beat, (counts.get(beat) || 0) + 1);
      if (!uniqueBeats.has(beat)) {
        const entry = {
          id: beat,
          label: titleCase(beat),
          firstSeenIn: lessonId,
        };
        if (colorMap?.[beat]) entry.color = colorMap[beat];
        uniqueBeats.set(beat, entry);
        beatFirstSeenIndex.set(beat, lessonIndex);
        firstSeenOrder.push(beat);
      } else if (!uniqueBeats.get(beat).color && colorMap?.[beat]) {
        uniqueBeats.get(beat).color = colorMap[beat];
      }
    }
  }

  report.totals.lessons = beatsByLesson.length;
  report.totals.unique_beats = uniqueBeats.size;
  report.totals.total_mentions = [...counts.values()].reduce((acc, value) => acc + value, 0);

  writeJSON(path.join(OUT_DIR, 'beats-by-lesson.json'), beatsByLesson);

  const orderedUnique = firstSeenOrder.map((id) => uniqueBeats.get(id));
  writeJSON(path.join(OUT_DIR, 'unique-beats.json'), orderedUnique);

  const csvLines = ['order,lessonId,beat'];
  firstSeenOrder.forEach((beatId, order) => {
    const lessonIndex = beatFirstSeenIndex.get(beatId);
    const lesson = beatsByLesson[lessonIndex];
    csvLines.push([order, lesson?.lessonId ?? '', beatId].join(','));
  });
  fs.writeFileSync(path.join(OUT_DIR, 'beat-unlock-sequence.csv'), `${csvLines.join('\n')}\n`, 'utf8');

  const sortedCounts = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  report.counts = Object.fromEntries(sortedCounts);
  report.top20 = sortedCounts.slice(0, 20).map(([id, count]) => ({ id, count }));

  writeJSON(path.join(OUT_DIR, 'validation-report.json'), report);

  console.log('✅ Extracted beats artifacts.');
}

function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

main().catch((error) => {
  console.error('Extraction failed:', error);
  process.exit(1);
});
