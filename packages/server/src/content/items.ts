import { loadTweetrunk, loadPractice, PracticeRow, TweetrunkRow } from "./loader";
import type { ItemBase } from "@shared/gameTypes";
import { BEATS } from "@shared/beatPalette";
import type { BeatKey } from "@shared/beatPalette";

let CACHE: { items: ItemBase[] } | null = null;

const BEAT_KEYS = new Set<BeatKey>(BEATS.map(b => b.key));

function canonBeat(b?: string) {
  if (!b) return undefined;
  const k = b.toLowerCase().replace(/[_-]/g, " ").trim();
  return (BEAT_KEYS.has(k as BeatKey) ? k : undefined) as BeatKey | undefined;
}

let autoId = 0;
function nextId(prefix: string) {
  autoId += 1;
  return `${prefix}-${autoId}`;
}

function buildLessonItem(row: TweetrunkRow): ItemBase {
  const id = row.id || nextId("t");
  const beats = (row.beat_tags || [])
    .map(canonBeat)
    .filter((b): b is BeatKey => Boolean(b));

  return {
    id,
    mode: "why",
    skillIds: beats.map(b => `beat.${b}`),
    passage: row.text,
    gold: { rationaleTags: row.lesson_tags || [] },
    meta: {
      title: row.title,
      lesson_tags: row.lesson_tags || [],
      beat_tags: beats,
      introduces_beats: (row.introduces_beats || [])
        .map(canonBeat)
        .filter((b): b is BeatKey => Boolean(b)),
      source: "tweetrunk",
    },
  };
}

function buildPracticeItem(row: PracticeRow, source: "practice_good" | "practice_bad"): ItemBase {
  const id = row.id || nextId(source === "practice_good" ? "pg" : "pb");
  const beats = (row.beat_tags || [])
    .map(canonBeat)
    .filter((b): b is BeatKey => Boolean(b));
  const mode = row.mode || "name";

  return {
    id,
    mode,
    skillIds: beats.map(b => `beat.${b}`),
    passage: row.passage,
    options: row.options,
    gold: {
      choiceId: row.gold?.choiceId,
      order: row.gold?.order?.map(canonBeat).filter((b): b is BeatKey => Boolean(b)),
      spans: row.gold?.spans,
      rationaleTags: row.gold?.rationaleTags,
      missingBeat: row.gold?.missingBeat,
    },
    meta: { source, difficulty: row.difficulty, beat_tags: beats },
  };
}

export function getAllItems(): ItemBase[] {
  if (CACHE) return CACHE.items;

  const lessons = loadTweetrunk().map(buildLessonItem);
  const practiceGood = loadPractice("good").map(r => buildPracticeItem(r, "practice_good"));
  const practiceBad = loadPractice("bad").map(r => buildPracticeItem(r, "practice_bad"));

  const items = [...lessons, ...practiceGood, ...practiceBad];

  CACHE = { items };
  return items;
}
