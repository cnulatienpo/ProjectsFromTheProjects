import { Router, type Response } from "express";
import fsp from "node:fs/promises";
import fs from "node:fs";
import path from "node:path";

import {
    bumpCounter,
    getOrCreatePlayer,
    loadShadowStore,
    normalizeKey,
    pickShadowTarget,
    recordSkip,
    saveShadowStore,
} from "../utils/shadowStore";
import type { IncomingContext, PlayerEntry, ShadowDimension } from "../utils/shadowStore";

interface PracticeRow {
    id: string | number;
    scene: string;
    beat?: string;
    pitfall?: string;
}

type ShadowPracticeRow = PracticeRow & { type?: string };

const router = Router();
const dataDir = path.resolve(process.cwd(), "public", "data", "cut_games");
const practiceCache: Record<string, Promise<ShadowPracticeRow[]>> = {};

router.get("/cut-games/catalog", async (_req, res) => {
    await sendJsonFile(res, "catalog.json");
});

router.get("/cut-games/introductions", async (_req, res) => {
    await sendJsonFile(res, "introductions.json");
});

router.get("/cut-games/beats", async (_req, res) => {
    await sendJsonFile(res, "beats_index.json");
});

router.get("/cut-games/tweetrunk", async (_req, res) => {
    const file = resolveDataFile("tweetrunk_renumbered.jsonl");
    try {
        await fsp.access(file);
    } catch {
        res.status(404).json({ error: "missing_bundle" });
        return;
    }

    res.type("application/x-ndjson");
    const stream = fs.createReadStream(file);
    stream.on("error", err => {
        if (!res.headersSent) res.status(500);
        res.end();
        console.error("[cut-games] stream error", err);
    });
    res.on("close", () => {
        stream.destroy();
    });
    stream.pipe(res);
});

router.post("/cut-games/telemetry", async (req, res) => {
    const playerId = derivePlayerId(req.get("X-Player-Id"));
    const body = (req.body ?? {}) as Record<string, unknown>;
    const event = typeof body.event === "string" ? body.event.toLowerCase() : "";
    const modeRaw = typeof body.mode === "string" ? body.mode.toLowerCase() : "";
    const meta = (typeof body.meta === "object" && body.meta)
        ? (body.meta as Record<string, unknown>)
        : undefined;

    if (event === "skip" && (modeRaw === "good" || modeRaw === "bad")) {
        try {
            const store = await loadShadowStore();
            const player = getOrCreatePlayer(store, playerId);
            recordSkip(player, {
                beat: typeof meta?.beat === "string" ? meta?.beat : undefined,
                pitfall: typeof meta?.pitfall === "string" ? meta?.pitfall : undefined,
                type: typeof meta?.type === "string" ? meta?.type : undefined,
            });
            await saveShadowStore(store);
        } catch (err) {
            console.error("[cut-games] telemetry error", err);
        }
    }

    res.json({ ok: true });
});

router.get("/cut-games/practice", async (req, res) => {
    const mode = String(req.query.mode || "").toLowerCase();
    if (mode !== "good" && mode !== "bad") {
        res.status(400).json({ error: "invalid_mode" });
        return;
    }

    const beatFilter = normalizeKey(typeof req.query.beat === "string" ? req.query.beat : undefined) ?? undefined;
    const pitfallFilter = normalizeKey(typeof req.query.pitfall === "string" ? req.query.pitfall : undefined) ?? undefined;

    if (pitfallFilter && mode !== "bad") {
        res.status(400).json({ error: "pitfall_only_for_bad" });
        return;
    }

    const playerId = derivePlayerId(req.get("X-Player-Id"));
    let player: PlayerEntry | null = null;
    let counter = 0;

    try {
        const store = await loadShadowStore();
        player = getOrCreatePlayer(store, playerId);
        bumpCounter(player);
        counter = player.counter;
        await saveShadowStore(store);
    } catch (err) {
        console.error("[cut-games] shadow store access", err);
    }

    try {
        const rows = await loadPractice(mode === "good" ? "practice_good.jsonl" : "practice_bad.jsonl");
        const incoming: IncomingContext = {
            beat: beatFilter,
            pitfall: pitfallFilter,
            mode: mode as "good" | "bad",
        };
        let responseRows: ShadowPracticeRow[] | null = null;

        if (player && counter > 0 && counter % 20 === 0) {
            responseRows = attemptShadowServe(rows, player, incoming);
        }

        if (!responseRows) {
            responseRows = filterPracticeRows(rows, incoming);
        }

        res.json(asPublicPracticeRows(responseRows));
    } catch (err) {
        console.error("[cut-games] practice error", err);
        res.status(500).json({ error: "practice_load_failed" });
    }
});

function resolveDataFile(name: string): string {
    return path.join(dataDir, name);
}

async function sendJsonFile(res: Response, filename: string) {
    const file = resolveDataFile(filename);
    try {
        await fsp.access(file);
    } catch {
        res.status(404).json({ error: "missing_bundle" });
        return;
    }
    res.sendFile(file, err => {
        if (err) {
            if (!res.headersSent) res.status(err.statusCode ?? 500);
            res.end();
        }
    });
}

async function loadPractice(filename: string): Promise<ShadowPracticeRow[]> {
    if (!practiceCache[filename]) {
        practiceCache[filename] = (async () => {
            const file = resolveDataFile(filename);
            const data = await fsp.readFile(file, "utf8");
            const lines = trimBOM(data).split(/\r?\n/);
            const rows: ShadowPracticeRow[] = [];
            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed) continue;
                try {
                    const parsed = JSON.parse(trimmed);
                    const id = parsed?.id ?? rows.length;
                    const scene = typeof parsed?.scene === "string" ? parsed.scene.trim() : "";
                    if (!scene) continue;
                    const beatValue = typeof parsed?.beat === "string" ? parsed.beat : undefined;
                    const pitfallValue = typeof parsed?.pitfall === "string" ? parsed.pitfall : undefined;
                    const typeValue = typeof parsed?.type === "string" ? parsed.type : undefined;
                    const beat = normalizeKey(beatValue) ?? undefined;
                    const pitfall = normalizeKey(pitfallValue) ?? undefined;
                    const type = normalizeKey(typeValue) ?? undefined;
                    rows.push({ id, scene, beat, pitfall, type });
                } catch (err) {
                    console.warn(`[cut-games] Skipping practice row: ${(err as Error).message}`);
                }
            }
            return rows;
        })();
    }

    return (await practiceCache[filename]).slice();
}

function attemptShadowServe(
    rows: ShadowPracticeRow[],
    player: PlayerEntry,
    incoming: IncomingContext,
): ShadowPracticeRow[] | null {
    const working: PlayerEntry = {
        counter: player.counter,
        skips: {
            beat: { ...player.skips.beat },
            pitfall: { ...player.skips.pitfall },
            type: { ...player.skips.type },
        },
        lastUpdated: player.lastUpdated,
    };

    while (true) {
        const target = pickShadowTarget(working, incoming);
        if (!target) break;
        delete working.skips[target.dimension][target.key];
        const matches = filterForShadowTarget(rows, target, incoming);
        if (matches.length) return matches;
    }

    return null;
}

function filterPracticeRows(rows: ShadowPracticeRow[], incoming: IncomingContext): ShadowPracticeRow[] {
    return rows.filter(row => {
        if (incoming.pitfall && (row.pitfall ?? null) !== incoming.pitfall) return false;
        if (incoming.beat && !matchesBeat(row, incoming.beat)) return false;
        return true;
    });
}

function asPublicPracticeRows(rows: ShadowPracticeRow[]): PracticeRow[] {
    return rows.map(row => {
        const { type: _omit, ...rest } = row;
        return rest;
    });
}

function filterForShadowTarget(
    rows: ShadowPracticeRow[],
    target: { dimension: ShadowDimension; key: string },
    incoming: IncomingContext,
): ShadowPracticeRow[] {
    const { dimension, key } = target;
    const beatFilter = incoming.beat;
    const pitfallFilter = incoming.pitfall;

    return rows.filter(row => {
        if (pitfallFilter && (row.pitfall ?? null) !== pitfallFilter) return false;
        if (beatFilter && !matchesBeat(row, beatFilter)) return false;

        switch (dimension) {
            case "pitfall":
                if (incoming.mode !== "bad") return false;
                return (row.pitfall ?? null) === key;
            case "beat":
                return matchesBeat(row, key);
            case "type":
                if (row.type && row.type === key) return true;
                if (row.beat && row.beat === key) return true;
                return sceneContainsWord(row.scene, key);
            default:
                return false;
        }
    });
}

function matchesBeat(row: ShadowPracticeRow, key: string): boolean {
    if (!key) return true;
    if (row.beat && row.beat === key) return true;
    return sceneContainsWord(row.scene, key);
}

function sceneContainsWord(scene: string, key: string): boolean {
    if (!scene || !key) return false;
    try {
        const pattern = new RegExp(`\\b${escapeRegExp(key)}\\b`, "i");
        return pattern.test(scene);
    } catch {
        return false;
    }
}

function escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function derivePlayerId(raw: string | undefined | null): string {
    if (typeof raw !== "string") return "anonymous";
    const trimmed = raw.trim();
    return trimmed || "anonymous";
}

function trimBOM(content: string): string {
    if (content.charCodeAt(0) === 0xfeff) return content.slice(1);
    return content;
}

export default router;
