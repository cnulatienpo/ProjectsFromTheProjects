import fsp from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const OUTPUT_DIR = path.resolve(ROOT, "public", "data", "cut_games");

interface TweetrunkEntry {
    id: number;
    title: string;
    type: "lesson" | "prompt" | "mixed" | "notelesson";
    lesson_tags: string[];
    beat_tags: string[];
    introduces_beats: string[];
    has_prompts: boolean;
}

interface PracticeEntry {
    id: string | number;
    scene: string;
    beat?: string;
    pitfall?: string;
}

interface BlueprintMode {
    name: string;
    desc?: string;
    [key: string]: unknown;
}

interface BlueprintData {
    modes: BlueprintMode[];
}

interface Summary {
    tweetrunkCount: number;
    goodCount: number;
    badCount: number;
    beatsIndex: BeatIndexEntry[];
    lessonsByTagCount: number;
    modes: BlueprintMode[];
}

interface BeatIndexEntry {
    beat: string;
    total: number;
    from_tweetrunk: number;
    from_good: number;
    from_bad: number;
}

type Warning = { file: string; message: string };

const IGNORES = ["**/node_modules/**", "**/.git/**", "**/public/data/cut_games/**"];

const ignoreMatchers = IGNORES.flatMap(pattern => expandBraces(pattern).map(globToRegex));

type FileLookup = {
    tweetrunk?: string;
    itemsIndex?: string;
    blueprints?: string;
    practiceGood?: string;
    practiceBad?: string;
};

async function main() {
    const warnings: Warning[] = [];
    const discovered: FileLookup = await locateFiles();

    if (!discovered.tweetrunk || !discovered.itemsIndex || !discovered.blueprints || !discovered.practiceGood || !discovered.practiceBad) {
        const missing = Object.entries({
            tweetrunk: discovered.tweetrunk,
            itemsIndex: discovered.itemsIndex,
            blueprints: discovered.blueprints,
            practiceGood: discovered.practiceGood,
            practiceBad: discovered.practiceBad
        })
            .filter(([, value]) => !value)
            .map(([key]) => key);
        throw new Error(`Missing required source files: ${missing.join(", ")}`);
    }

    const tweetrunk = await readTweetrunk(discovered.tweetrunk, warnings);
    const lessonsFromCsv = await readItemsIndex(discovered.itemsIndex, warnings);
    const mergedTweetrunk = mergeLessonMetadata(tweetrunk, lessonsFromCsv);
    const blueprints = await readBlueprints(discovered.blueprints, warnings);
    const practiceGood = await readPractice(discovered.practiceGood, warnings, "good");
    const practiceBad = await readPractice(discovered.practiceBad, warnings, "bad");

    const beatsIndex = buildBeatsIndex(mergedTweetrunk, practiceGood, practiceBad);
    const { lessonsByTag, lessonsFlat } = buildLessonIndex(mergedTweetrunk);
    const introductions = buildIntroductions(mergedTweetrunk);
    const practiceCatalog = buildPracticeCatalog(practiceGood, practiceBad);
    const catalog: Summary = {
        tweetrunkCount: mergedTweetrunk.length,
        goodCount: practiceGood.length,
        badCount: practiceBad.length,
        beatsIndex,
        lessonsByTagCount: lessonsByTag.length,
        modes: blueprints.modes
    };

    await fsp.mkdir(OUTPUT_DIR, { recursive: true });

    await Promise.all([
        writeJson("catalog.json", catalog),
        writeJson("beats_index.json", beatsIndex),
        writeJson("lessons_index.json", { byTag: lessonsByTag, lessons: lessonsFlat }),
        writeJson("introductions.json", introductions),
        writeJson("practice_catalog.json", practiceCatalog),
        copyFile(discovered.practiceGood, "practice_good.jsonl"),
        copyFile(discovered.practiceBad, "practice_bad.jsonl"),
        copyFile(discovered.tweetrunk, "tweetrunk_renumbered.jsonl"),
        copyFile(discovered.blueprints, "game_blueprints.json")
    ]);

    logSummary(discovered, mergedTweetrunk.length, practiceGood.length, practiceBad.length, warnings, beatsIndex.length, lessonsByTag.length);
}

async function locateFiles(): Promise<FileLookup> {
    const patterns = {
        tweetrunk: [
            "game thingss/cut_games_pack*/**/*cut*games*{tweetrunk*,renumbered*}.jsonl",
            "game thingss/**/*cut*games*{tweetrunk*,renumbered*}.jsonl",
            "game thingss/**/*tweetrunk*renumbered*.jsonl",
            "content/**/*cut*games*{tweetrunk*,renumbered*}.jsonl",
            "data/**/*cut*games*{tweetrunk*,renumbered*}.jsonl",
            "**/*cut*games*{tweetrunk*,renumbered*}.jsonl",
            "**/tweetrunk_renumbered*.jsonl"
        ],
        itemsIndex: [
            "game thingss/cut_games_pack*/**/*cut*games*items_index*.csv",
            "game thingss/**/*cut*games*items_index*.csv",
            "game thingss/**/*items_index*.csv",
            "content/**/*cut*games*items_index*.csv",
            "data/**/*cut*games*items_index*.csv",
            "**/*cut*games*items_index*.csv",
            "**/items_index*.csv"
        ],
        blueprints: [
            "game thingss/cut_games_pack*/**/*cut*games*game_blueprints*.json",
            "game thingss/**/*cut*games*game_blueprints*.json",
            "game thingss/**/*game_blueprints*.json",
            "content/**/*cut*games*game_blueprints*.json",
            "data/**/*cut*games*game_blueprints*.json",
            "**/*cut*games*game_blueprints*.json",
            "**/game_blueprints*.json"
        ],
        practiceGood: [
            "game thingss/cut_games_pack*/**/*cut*games*practice_good*.jsonl",
            "game thingss/**/*cut*games*practice_good*.jsonl",
            "game thingss/**/*practice_good*.jsonl",
            "content/**/*cut*games*practice_good*.jsonl",
            "data/**/*cut*games*practice_good*.jsonl",
            "**/*cut*games*practice_good*.jsonl",
            "**/practice_good*.jsonl"
        ],
        practiceBad: [
            "game thingss/cut_games_pack*/**/*cut*games*practice_bad*.jsonl",
            "game thingss/**/*cut*games*practice_bad*.jsonl",
            "game thingss/**/*practice_bad*.jsonl",
            "content/**/*cut*games*practice_bad*.jsonl",
            "data/**/*cut*games*practice_bad*.jsonl",
            "**/*cut*games*practice_bad*.jsonl",
            "**/practice_bad*.jsonl"
        ]
    } as const;

    const result: FileLookup = {};
    for (const key of Object.keys(patterns) as (keyof typeof patterns)[]) {
        const match = await findFirst(patterns[key]);
        if (match) (result as any)[key] = match;
    }
    return result;
}

async function findFirst(patterns: readonly string[]): Promise<string | undefined> {
    for (const pattern of patterns) {
        const expanded = expandBraces(pattern);
        for (const candidate of expanded) {
            const matcher = globToRegex(candidate);
            const match = await walkForMatch(ROOT, "", matcher);
            if (match) return match;
        }
    }
    return undefined;
}

function expandBraces(pattern: string): string[] {
    const stack: string[] = [];
    const index = pattern.indexOf("{");
    if (index === -1) return [pattern];
    let depth = 0;
    let end = -1;
    for (let i = index; i < pattern.length; i++) {
        const ch = pattern[i];
        if (ch === "{") depth++;
        else if (ch === "}") {
            depth--;
            if (depth === 0) {
                end = i;
                break;
            }
        }
    }
    if (end === -1) return [pattern];
    const before = pattern.slice(0, index);
    const after = pattern.slice(end + 1);
    const inner = pattern.slice(index + 1, end);
    for (const option of inner.split(",")) {
        stack.push(...expandBraces(before + option + after));
    }
    return stack;
}

function globToRegex(pattern: string): RegExp {
    let regex = "^";
    for (let i = 0; i < pattern.length; i++) {
        const ch = pattern[i];
        if (ch === "*") {
            if (pattern[i + 1] === "*") {
                regex += ".*";
                i++;
            } else {
                regex += "[^/]*";
            }
        } else if (ch === "?") {
            regex += ".";
        } else if (ch === "/") {
            regex += "\\/";
        } else {
            regex += escapeRegex(ch);
        }
    }
    regex += "$";
    return new RegExp(regex, "i");
}

function escapeRegex(value: string): string {
    return value.replace(/[|\\{}()[\]^$+?.]/g, "\\$&");
}

async function walkForMatch(base: string, rel: string, matcher: RegExp): Promise<string | undefined> {
    const dir = rel ? path.join(base, rel) : base;
    let entries: any[] = [];
    try {
        entries = await fsp.readdir(dir, { withFileTypes: true });
    } catch {
        return undefined;
    }
    for (const entry of entries) {
        const nextRel = rel ? `${rel}/${entry.name}` : entry.name;
        const isDir = typeof entry.isDirectory === "function" ? entry.isDirectory() : false;
        if (isIgnored(nextRel, isDir)) continue;
        if (typeof entry.isFile === "function" && entry.isFile()) {
            if (matcher.test(nextRel)) return path.resolve(base, nextRel);
        } else if (isDir) {
            const found = await walkForMatch(base, nextRel, matcher);
            if (found) return found;
        }
    }
    return undefined;
}

function isIgnored(relPath: string, isDir: boolean): boolean {
    const testPath = isDir ? `${relPath}/` : relPath;
    return ignoreMatchers.some(rx => rx.test(testPath));
}

function trimBOM(content: string): string {
    if (content.charCodeAt(0) === 0xfeff) {
        return content.slice(1);
    }
    return content;
}

function parseCsv(content: string): Record<string, string>[] {
    const text = trimBOM(content);
    const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length === 0) return [];
    const headers = splitCsvLine(lines[0]).map(h => h.trim());
    const records: Record<string, string>[] = [];
    for (let i = 1; i < lines.length; i++) {
        const values = splitCsvLine(lines[i]);
        const record: Record<string, string> = {};
        headers.forEach((header, index) => {
            record[header] = (values[index] ?? "").trim();
        });
        records.push(record);
    }
    return records;
}

function splitCsvLine(line: string): string[] {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
            if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (ch === "," && !inQuotes) {
            result.push(current);
            current = "";
        } else {
            current += ch;
        }
    }
    result.push(current);
    return result;
}

function normalizeTags(value: unknown): string[] {
    if (!value) return [];
    const seen = new Set<string>();
    const push = (token: string) => {
        const trimmed = token.trim().toLowerCase();
        if (trimmed) seen.add(trimmed);
    };

    if (Array.isArray(value)) {
        for (const v of value) {
            if (typeof v === "string") push(v);
        }
    } else if (typeof value === "string") {
        const base = trimBOM(value);
        const semiParts = base.includes(";") ? base.split(";") : [base];
        for (const part of semiParts) {
            const commaParts = part.includes(",") ? part.split(",") : [part];
            for (const token of commaParts) push(token);
        }
    }
    return Array.from(seen);
}

async function readTweetrunk(file: string, warnings: Warning[]): Promise<TweetrunkEntry[]> {
    const raw = trimBOM(await fsp.readFile(file, "utf8"));
    const lines = raw.split(/\r?\n/);
    const entries: TweetrunkEntry[] = [];
    let lineNo = 0;
    for (const line of lines) {
        lineNo += 1;
        const trimmed = line.trim();
        if (!trimmed) continue;
        try {
            const parsed = JSON.parse(trimmed);
            const entry = coerceTweetrunk(parsed, `${file}:${lineNo}`);
            if (entry) entries.push(entry);
        } catch (err) {
            warnings.push({ file, message: `Invalid JSON at line ${lineNo}: ${(err as Error).message}` });
        }
    }
    return entries;
}

function coerceTweetrunk(value: any, context: string): TweetrunkEntry | null {
    const warnings: string[] = [];
    const rawId = value?.id ?? value?.new_id ?? value?.newId ?? value?.ID;
    const id = Number(rawId);
    if (!Number.isFinite(id)) warnings.push("missing numeric id");
    const title = typeof value?.title === "string" ? value.title.trim() : "";
    if (!title) warnings.push("missing title");
    const rawType = String(value?.type || "").toLowerCase();
    const typeMap: Record<string, TweetrunkEntry["type"]> = { note: "notelesson" };
    const type = typeMap[rawType as keyof typeof typeMap] || rawType;
    const allowedTypes = new Set(["lesson", "prompt", "mixed", "notelesson"]);
    if (!allowedTypes.has(type)) warnings.push(`invalid type '${value?.type}'`);
    const lesson_tags = normalizeTags(value?.lesson_tags ?? value?.lessonTags);
    const beat_tags = normalizeTags(value?.beat_tags ?? value?.beatTags ?? value?.primary_beat ?? value?.primaryBeat);
    const introduces_beats = normalizeTags(value?.introduces_beats ?? value?.introducesBeats);
    const has_prompts = coerceBoolean(value?.has_prompts ?? value?.hasPrompts);

    if (warnings.length) {
        globalWarnings.push({ file: context, message: warnings.join(", ") });
        if (!Number.isFinite(id) || !title || !allowedTypes.has(type as any)) return null;
    }

    return {
        id,
        title,
        type: type as TweetrunkEntry["type"],
        lesson_tags,
        beat_tags,
        introduces_beats,
        has_prompts
    };
}

const globalWarnings: Warning[] = [];

function coerceBoolean(value: unknown): boolean {
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value !== 0;
    if (typeof value === "string") {
        const v = value.trim().toLowerCase();
        if (["y", "yes", "true", "1"].includes(v)) return true;
        if (["n", "no", "false", "0"].includes(v)) return false;
    }
    return false;
}

async function readItemsIndex(file: string, warnings: Warning[]): Promise<Map<number, Partial<TweetrunkEntry>>> {
    const raw = trimBOM(await fsp.readFile(file, "utf8"));
    const records = parseCsv(raw);

    const result = new Map<number, Partial<TweetrunkEntry>>();
    let row = 1;
    for (const record of records) {
        row += 1;
        const id = Number(record.id);
        if (!Number.isFinite(id)) {
            warnings.push({ file, message: `Row ${row}: invalid id '${record.id}'` });
            continue;
        }
        const type = typeof record.type === "string" ? record.type.trim().toLowerCase() : undefined;
        const lesson_tags = normalizeTags(record.lesson_tags ?? record.lessonTags);
        const beat_tags = normalizeTags(record.beat_tags ?? record.beatTags);
        const introduces_beats = normalizeTags(record.introduces_beats ?? record.introducesBeats);
        const title = typeof record.title === "string" ? record.title.trim() : undefined;
        const has_prompts = record.has_prompts != null ? coerceBoolean(record.has_prompts) : undefined;
        result.set(id, {
            id,
            title,
            type: type as any,
            lesson_tags,
            beat_tags,
            introduces_beats,
            has_prompts
        });
    }
    return result;
}

function mergeLessonMetadata(base: TweetrunkEntry[], csv: Map<number, Partial<TweetrunkEntry>>): TweetrunkEntry[] {
    return base.map(entry => {
        const extra = csv.get(entry.id);
        if (!extra) return entry;
        const merged: TweetrunkEntry = {
            ...entry,
            title: extra.title || entry.title,
            type: (extra.type as any) || entry.type,
            lesson_tags: extra.lesson_tags?.length ? extra.lesson_tags : entry.lesson_tags,
            beat_tags: extra.beat_tags?.length ? extra.beat_tags : entry.beat_tags,
            introduces_beats: extra.introduces_beats?.length ? extra.introduces_beats : entry.introduces_beats,
            has_prompts: typeof extra.has_prompts === "boolean" ? extra.has_prompts : entry.has_prompts
        };
        return merged;
    });
}

async function readBlueprints(file: string, warnings: Warning[]): Promise<BlueprintData> {
    try {
        const raw = trimBOM(await fsp.readFile(file, "utf8"));
        const parsed = JSON.parse(raw);
        const modesInput = Array.isArray(parsed?.modes) ? parsed.modes : [];
        const modes: BlueprintMode[] = [];
        modesInput.forEach((mode: any, idx: number) => {
            const name = typeof mode?.name === "string" ? mode.name.trim() : "";
            if (!name) {
                warnings.push({ file, message: `Mode #${idx + 1} missing name` });
                return;
            }
            const desc = typeof mode?.desc === "string" ? mode.desc.trim() : undefined;
            const rest: Record<string, unknown> = {};
            Object.keys(mode || {}).forEach(key => {
                if (key === "name" || key === "desc") return;
                rest[key] = mode[key];
            });
            const modeEntry: BlueprintMode = { name };
            if (desc) modeEntry.desc = desc;
            for (const [key, val] of Object.entries(rest)) {
                modeEntry[key] = val;
            }
            modes.push(modeEntry);
        });
        return { modes };
    } catch (err) {
        warnings.push({ file, message: `Failed to parse blueprints: ${(err as Error).message}` });
        return { modes: [] };
    }
}

async function readPractice(file: string, warnings: Warning[], mode: "good" | "bad"): Promise<PracticeEntry[]> {
    const raw = trimBOM(await fsp.readFile(file, "utf8"));
    const lines = raw.split(/\r?\n/);
    const entries: PracticeEntry[] = [];
    let index = 0;
    for (const line of lines) {
        index += 1;
        const trimmed = line.trim();
        if (!trimmed) continue;
        try {
            const parsed = JSON.parse(trimmed);
            const id = parsed?.id;
            const scene = typeof parsed?.scene === "string" ? parsed.scene.trim() : "";
            if (!scene) {
                warnings.push({ file, message: `${mode} line ${index}: missing scene` });
                continue;
            }
            const beat = typeof parsed?.beat === "string" ? parsed.beat.trim().toLowerCase() : undefined;
            const pitfall = typeof parsed?.pitfall === "string" ? parsed.pitfall.trim().toLowerCase() : undefined;
            entries.push({ id: id ?? `${mode}-${index}`, scene, beat, pitfall });
        } catch (err) {
            warnings.push({ file, message: `${mode} line ${index}: ${(err as Error).message}` });
        }
    }
    return entries;
}

function buildBeatsIndex(lessons: TweetrunkEntry[], good: PracticeEntry[], bad: PracticeEntry[]): BeatIndexEntry[] {
    const counts = new Map<string, BeatIndexEntry>();
    const ensure = (beat: string) => {
        const key = beat.trim().toLowerCase();
        if (!key) return undefined;
        if (!counts.has(key)) {
            counts.set(key, { beat: key, total: 0, from_tweetrunk: 0, from_good: 0, from_bad: 0 });
        }
        return counts.get(key)!;
    };

    for (const lesson of lessons) {
        const beats = new Set([...lesson.beat_tags, ...lesson.introduces_beats]);
        for (const beat of beats) {
            const entry = ensure(beat);
            if (!entry) continue;
            entry.total += 1;
            entry.from_tweetrunk += 1;
        }
    }

    for (const item of good) {
        if (!item.beat) continue;
        const entry = ensure(item.beat);
        if (!entry) continue;
        entry.total += 1;
        entry.from_good += 1;
    }

    for (const item of bad) {
        if (!item.beat) continue;
        const entry = ensure(item.beat);
        if (!entry) continue;
        entry.total += 1;
        entry.from_bad += 1;
    }

    return Array.from(counts.values()).sort((a, b) => a.beat.localeCompare(b.beat));
}

function buildLessonIndex(lessons: TweetrunkEntry[]) {
    const byTagMap = new Map<string, { tag: string; ids: number[] }>();
    for (const lesson of lessons) {
        for (const tag of lesson.lesson_tags) {
            if (!byTagMap.has(tag)) {
                byTagMap.set(tag, { tag, ids: [] });
            }
            const record = byTagMap.get(tag)!;
            if (!record.ids.includes(lesson.id)) record.ids.push(lesson.id);
        }
    }
    const lessonsByTag = Array.from(byTagMap.values()).map(entry => ({
        tag: entry.tag,
        count: entry.ids.length,
        ids: entry.ids.sort((a, b) => a - b)
    })).sort((a, b) => a.tag.localeCompare(b.tag));

    const lessonsFlat = lessons.map(lesson => ({
        id: lesson.id,
        title: lesson.title,
        type: lesson.type,
        lesson_tags: lesson.lesson_tags,
        beat_tags: lesson.beat_tags,
        introduces_beats: lesson.introduces_beats,
        has_prompts: lesson.has_prompts
    })).sort((a, b) => a.id - b.id);

    return { lessonsByTag, lessonsFlat };
}

function buildIntroductions(lessons: TweetrunkEntry[]) {
    const map = new Map<string, number[]>();
    for (const lesson of lessons) {
        if (!lesson.introduces_beats.length) continue;
        for (const beat of lesson.introduces_beats) {
            const key = beat.trim().toLowerCase();
            if (!key) continue;
            if (!map.has(key)) map.set(key, []);
            map.get(key)!.push(lesson.id);
        }
    }
    const result: Record<string, number[]> = {};
    for (const [beat, ids] of map) {
        result[beat] = Array.from(new Set(ids)).sort((a, b) => a - b);
    }
    return result;
}

function buildPracticeCatalog(good: PracticeEntry[], bad: PracticeEntry[]) {
    const pitfalls = new Map<string, number>();
    for (const entry of bad) {
        if (!entry.pitfall) continue;
        const key = entry.pitfall.trim().toLowerCase();
        if (!key) continue;
        pitfalls.set(key, (pitfalls.get(key) || 0) + 1);
    }
    return {
        good,
        bad,
        pitfalls: Array.from(pitfalls.entries()).map(([pitfall, count]) => ({ pitfall, count })).sort((a, b) => a.pitfall.localeCompare(b.pitfall))
    };
}

async function writeJson(filename: string, value: unknown) {
    const target = path.join(OUTPUT_DIR, filename);
    await fsp.writeFile(target, JSON.stringify(value, null, 2) + "\n", "utf8");
}

async function copyFile(source: string, filename: string) {
    const target = path.join(OUTPUT_DIR, filename);
    await fsp.copyFile(source, target);
}

function logSummary(files: FileLookup, tweetrunkCount: number, goodCount: number, badCount: number, warnings: Warning[], beatsCount: number, lessonTagCount: number) {
    const lines: string[] = [];
    lines.push("[cut-games] Source files:");
    Object.entries(files).forEach(([key, value]) => {
        lines.push(`  - ${key}: ${value}`);
    });
    lines.push(`[cut-games] Tweetrunk entries: ${tweetrunkCount}`);
    lines.push(`[cut-games] Practice good: ${goodCount}`);
    lines.push(`[cut-games] Practice bad: ${badCount}`);
    lines.push(`[cut-games] Unique beats: ${beatsCount}`);
    lines.push(`[cut-games] Lesson tags: ${lessonTagCount}`);
    if (warnings.length || globalWarnings.length) {
        lines.push(`[cut-games] Warnings (${warnings.length + globalWarnings.length}):`);
        for (const w of [...globalWarnings, ...warnings]) {
            lines.push(`  ! ${w.file} :: ${w.message}`);
        }
    } else {
        lines.push("[cut-games] No validation warnings.");
    }
    console.log(lines.join("\n"));
}

main().catch(err => {
    console.error("[cut-games] Failed:", err);
    process.exitCode = 1;
});
