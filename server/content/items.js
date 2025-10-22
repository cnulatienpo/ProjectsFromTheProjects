import { loadTweetrunk, loadPractice } from "./loaders.js";
import { BEATS } from "../lib/beatPalette.js";

let CACHE = null;

const BEAT_KEYS = new Set(BEATS.map(b => b.key));

function canonBeat(b) {
    if (!b) return undefined;
    const k = b.toLowerCase().replace(/[_-]/g, " ").trim();
    return BEAT_KEYS.has(k) ? k : undefined;
}

let autoId = 0;
function nextId(prefix) {
    autoId += 1;
    return `${prefix}-${autoId}`;
}

function buildLessonItem(row) {
    const id = row.id || nextId("t");
    const beatTags = Array.isArray(row.beat_tags) ? row.beat_tags : [];
    const beats = beatTags
        .map(canonBeat)
        .filter(b => Boolean(b));

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
            introduces_beats: Array.isArray(row.introduces_beats) ? row.introduces_beats
                .map(canonBeat)
                .filter(b => Boolean(b)) : [],
            source: "tweetrunk",
        },
    };
}

function buildPracticeItem(row, source) {
    const id = row.id || nextId(source === "practice_good" ? "pg" : "pb");
    const beatTags = Array.isArray(row.beat_tags) ? row.beat_tags : [];
    const beats = beatTags
        .map(canonBeat)
        .filter(b => Boolean(b));
    const mode = row.mode || "name";

    return {
        id,
        mode,
        skillIds: beats.map(b => `beat.${b}`),
        passage: row.passage,
        options: row.options,
        gold: {
            choiceId: row.gold?.choiceId,
            order: Array.isArray(row.gold?.order) ? row.gold.order.map(canonBeat).filter(b => Boolean(b)) : [],
            spans: row.gold?.spans,
            rationaleTags: row.gold?.rationaleTags,
            missingBeat: row.gold?.missingBeat,
        },
        meta: { source, difficulty: row.difficulty, beat_tags: beats },
    };
}

export function getAllItems() {
    if (CACHE) return CACHE.items;

    const lessons = loadTweetrunk().map(buildLessonItem);
    const practiceGood = loadPractice("good").map(r => buildPracticeItem(r, "practice_good"));
    const practiceBad = loadPractice("bad").map(r => buildPracticeItem(r, "practice_bad"));

    const items = [...lessons, ...practiceGood, ...practiceBad];

    CACHE = { items };
    return items;
}

export function getItemById(id) {
    if (!id) return null;
    const strId = String(id);
    return getAllItems().find(item => String(item.id) === strId) || null;
}
