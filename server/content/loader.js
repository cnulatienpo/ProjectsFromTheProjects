import fs from "node:fs";
import path from "node:path";

function resolveExisting(paths) {
    for (const candidate of paths) {
        if (fs.existsSync(candidate)) return candidate;
    }
    throw new Error(`Missing content file. Checked: ${paths.join(", ")}`);
}

function readJSONL(absPath) {
    const buf = fs.readFileSync(absPath, "utf8");
    return buf
        .split(/\r?\n/)
        .map(l => l.trim())
        .filter(Boolean)
        .map(l => JSON.parse(l));
}

const ROOT = process.env.PROJECT_ROOT || process.cwd();

export function loadTweetrunk() {
    const p = resolveExisting([
        path.join(ROOT, "content", "tweetrunk", "tweetrunk_renumbered.jsonl"),
        path.join(ROOT, "public", "data", "cut_games", "tweetrunk_renumbered.jsonl"),
        path.join(ROOT, "labeled data", "tweetrunk_renumbered.jsonl"),
        path.join(ROOT, "app", "public", "data", "cut_games", "tweetrunk_renumbered.jsonl"),
    ]);
    return readJSONL(p);
}

export function loadPractice(kind) {
    const file = kind === "good" ? "practice_good.jsonl" : "practice_bad.jsonl";
    const p = resolveExisting([
        path.join(ROOT, "content", "practice", file),
        path.join(ROOT, "public", "data", "cut_games", file),
        path.join(ROOT, "app", "public", "data", "cut_games", file),
    ]);
    return readJSONL(p);
}
