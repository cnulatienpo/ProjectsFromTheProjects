import fs from "fs";
import path from "path";

export type TweetrunkRow = {
  id?: string;
  type: "lesson"|"practice";
  title: string;
  lesson_tags?: string[];
  beat_tags?: string[];
  introduces_beats?: string[];
  has_prompts?: boolean;
  text: string;
};

export type PracticeRow = {
  id?: string;
  beat_tags?: string[];
  mode?: "name"|"missing"|"order"|"highlight"|"fix"|"why";
  passage: string;
  options?: { id: string; text: string; rationale?: string }[];
  gold?: {
    choiceId?: string;
    order?: string[];
    spans?: { start:number; end:number; label?: string }[];
    rationaleTags?: string[];
    missingBeat?: string;
  };
  difficulty?: "easy"|"med"|"hard";
};

function resolveExisting(paths: string[]): string {
  for (const candidate of paths) {
    if (fs.existsSync(candidate)) return candidate;
  }
  throw new Error(`Missing content file. Checked: ${paths.join(", ")}`);
}

function readJSONL<T>(absPath: string): T[] {
  const buf = fs.readFileSync(absPath, "utf8");
  return buf
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(Boolean)
    .map(l => JSON.parse(l));
}

const ROOT = process.cwd();

export function loadTweetrunk(): TweetrunkRow[] {
  const p = resolveExisting([
    path.join(ROOT, "content", "tweetrunk", "tweetrunk_renumbered.jsonl"),
    path.join(ROOT, "public", "data", "cut_games", "tweetrunk_renumbered.jsonl"),
    path.join(ROOT, "labeled data", "tweetrunk_renumbered.jsonl"),
  ]);
  return readJSONL<TweetrunkRow>(p);
}

export function loadPractice(kind: "good"|"bad"): PracticeRow[] {
  const file = kind === "good" ? "practice_good.jsonl" : "practice_bad.jsonl";
  const p = resolveExisting([
    path.join(ROOT, "content", "practice", file),
    path.join(ROOT, "public", "data", "cut_games", file),
  ]);
  return readJSONL<PracticeRow>(p);
}
