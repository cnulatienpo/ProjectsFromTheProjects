import type { RagQuery, RagResult, RagDimensionScore, RagCitation, RagEvidence } from "@/lib/rag-types";

export async function tryGradeWithRagGrader(q: RagQuery, contexts: { title: string, text: string }[]): Promise<RagResult | null> {
    let mod: any = null;
    try {
        mod = await import("@/ragGrader");
    } catch {
        try { mod = await import("../../ragGrader"); } catch { /* not found */ }
    }
    if (!mod) return null;

    const fn = (mod.grade || mod.evaluate || mod.score || mod.default);
    if (typeof fn !== "function") return null;

    let raw: any;
    try {
        raw = await fn({ text: q.text, level: q.level, writerType: q.writerType, contexts });
    } catch {
        try { raw = await fn(q.text, { level: q.level, writerType: q.writerType, contexts }); }
        catch {
            try { raw = await fn(q.text, contexts, q.level, q.writerType); }
            catch { return null; }
        }
    }

    if (raw && typeof raw === "object" &&
        "overall" in raw && "dimensions" in raw && "tips" in raw) {
        return {
            overall: clamp(raw.overall),
            dimensions: normalizeDims(raw.dimensions),
            flags: Array.isArray(raw.flags) ? raw.flags : [],
            tips: Array.isArray(raw.tips) ? raw.tips : [],
            citations: normalizeCitations(raw.citations),
            evidence: normalizeEvidence(raw.evidence),
            model: String(raw.model || "ragGrader"),
            debug: { ...(raw.debug || {}), usedOfflineMock: false }
        };
    }

    const mapped: RagResult = {
        overall: clamp(raw?.score ?? raw?.overall ?? 0.5),
        dimensions: normalizeDims(raw?.axes ?? raw?.dimensions ?? []),
        flags: Array.isArray(raw?.flags) ? raw.flags : [],
        tips: Array.isArray(raw?.suggestions) ? raw.suggestions : Array.isArray(raw?.tips) ? raw.tips : [],
        citations: normalizeCitations(raw?.sources ?? raw?.citations),
        evidence: normalizeEvidence(raw?.evidence),
        model: "ragGrader",
        debug: { from: "ragGrader-mapped", usedOfflineMock: false }
    };
    return mapped;
}

function clamp(n: any) { const x = Number(n); return isFinite(x) ? Math.max(0, Math.min(1, x)) : 0.5; }

function normalizeDims(d: any): RagDimensionScore[] {
    if (!Array.isArray(d)) return [];
    return d.map((x: any) => ({
        name: String(x?.name ?? x?.key ?? "Unknown"),
        score: clamp(x?.score ?? x?.value ?? x?.rating ?? 0.5),
        rationale: String(x?.rationale ?? x?.why ?? x?.note ?? "")
    }));
}

function normalizeCitations(c: any): RagCitation[] {
    if (!Array.isArray(c)) return [];
    return c.map((x: any, i: number) => ({
        id: String(x?.id ?? `c${i}`),
        title: String(x?.title ?? x?.name ?? "Context"),
        snippet: String(x?.snippet ?? x?.text ?? "").slice(0, 240),
        score: clamp(x?.score ?? x?.relevance ?? 0.5)
    }));
}

function normalizeEvidence(e: any): RagEvidence[] {
    if (!Array.isArray(e)) return [];
    return e.map((x: any) => ({
        quote: String(x?.quote ?? x?.span ?? "").slice(0, 180),
        note: String(x?.note ?? x?.why ?? ""),
        start: typeof x?.start === "number" ? x.start : undefined,
        end: typeof x?.end === "number" ? x.end : undefined,
    }));
}

export * from "./prompts";
export * from "./snippets";
export * from "./report-evolve.part1";
export * from "./report-evolve.part2";
export * from "./rag-types";
// @ts-ignore
export * from "./rag-eval";
export * from "./rag-adapter";
export * from "./rag-store.local";

export type RagQuery = {
    text: string;
    level?: number;
    writerType?: string | null;
    maxSuggestions?: number;
};

export type RagCitation = {
    id: string;
    title: string;
    snippet: string;
    score: number;
};

export type RagDimensionScore = {
    name: string;
    score: number;
    rationale: string;
};

export type RagEvidence = {
    quote: string;
    note: string;
    start?: number;
    end?: number;
};

export type RagResult = {
    overall: number;
    dimensions: RagDimensionScore[];
    flags: string[];
    tips: string[];
    citations: RagCitation[];
    evidence: RagEvidence[];
    model?: string;
    debug?: { retrievedCount?: number; usedOfflineMock?: boolean; from?: string };
};

export type StoreDoc = { id: string; title: string; text: string; tags?: string[] };
export const DOCS: StoreDoc[] = [
    {
        id: "beats-basic",
        title: "Scene Beats — Basics",
        text: "Opening image sets tone. Inciting incident disrupts normal. Stakes rise. Reversal complicates. Climax demands choice. Resolution sets new normal.",
        tags: ["structure", "beats", "level:1"]
    },
    {
        id: "voice-choices",
        title: "Voice & Choice Quick Guide",
        text: "Voice emerges from diction, rhythm, POV distance, and patterning. Track repeated choices—the grain of the writer. Avoid paste-gloss: sudden style shifts.",
        tags: ["voice", "style", "level:1-3"]
    },
    {
        id: "devices",
        title: "Device Layering",
        text: "Consistently layer metaphor, foreshadowing, reversal, and motif. Devices should support character pressure, not decorate.",
        tags: ["devices", "structure", "level:2-4"]
    }
];

export function retrieveRelevant(query: string, k = 4): StoreDoc[] {
    const q = query.toLowerCase();
    const score = (t: string) => {
        const words = new Set(q.split(/\W+/).filter(Boolean));
        let hit = 0;
        for (const w of words) if (t.toLowerCase().includes(w)) hit++;
        return hit / Math.max(6, words.size);
    };
    return [...DOCS]
        .map(d => ({ d, s: (score(d.text) + score(d.title)) / 2 }))
        .sort((a, b) => b.s - a.s)
        .slice(0, k)
        .map(x => x.d);
}

const fs = require("fs");
const path = require("path");

const DOCS_DIR = path.join(__dirname, "..", "docs");
const EXTENSIONS = [".md"];
const CODE_LANGS = ["ts", "tsx", "javascript"];

let failed = false;

for (const file of fs.readdirSync(DOCS_DIR)) {
    if (!EXTENSIONS.includes(path.extname(file))) continue;
    const content = fs.readFileSync(path.join(DOCS_DIR, file), "utf8");
    for (const lang of CODE_LANGS) {
        const regex = new RegExp("```" + lang, "i");
        if (regex.test(content)) {
            console.error(`❌ Fenced code block with language "${lang}" found in ${file}`);
            failed = true;
        }
    }
}

if (failed) {
    process.exit(1);
} else {
    console.log("✅ Content guard passed: No executable code blocks in docs/*.md");
}
