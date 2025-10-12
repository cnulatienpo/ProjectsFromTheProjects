import { Router, type Response } from "express";
import fsp from "node:fs/promises";
import fs from "node:fs";
import path from "node:path";

interface PracticeRow {
    id: string | number;
    scene: string;
    beat?: string;
    pitfall?: string;
}

const router = Router();
const dataDir = path.resolve(process.cwd(), "public", "data", "cut_games");

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

router.get("/cut-games/practice", async (req, res) => {
    const mode = String(req.query.mode || "").toLowerCase();
    if (mode !== "good" && mode !== "bad") {
        res.status(400).json({ error: "invalid_mode" });
        return;
    }

    const beatFilter = typeof req.query.beat === "string" ? req.query.beat.trim().toLowerCase() : undefined;
    const pitfallFilter = typeof req.query.pitfall === "string" ? req.query.pitfall.trim().toLowerCase() : undefined;

    if (pitfallFilter && mode !== "bad") {
        res.status(400).json({ error: "pitfall_only_for_bad" });
        return;
    }

    try {
        const rows = await loadPractice(mode === "good" ? "practice_good.jsonl" : "practice_bad.jsonl");
        const filtered = rows.filter(row => {
            if (beatFilter && (row.beat || "").toLowerCase() !== beatFilter) return false;
            if (pitfallFilter && (row.pitfall || "").toLowerCase() !== pitfallFilter) return false;
            return true;
        });
        res.json(filtered);
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

async function loadPractice(filename: string): Promise<PracticeRow[]> {
    const file = resolveDataFile(filename);
    const data = await fsp.readFile(file, "utf8");
    const lines = trimBOM(data).split(/\r?\n/);
    const rows: PracticeRow[] = [];
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        try {
            const parsed = JSON.parse(trimmed);
            const id = parsed?.id ?? rows.length;
            const scene = typeof parsed?.scene === "string" ? parsed.scene.trim() : "";
            if (!scene) continue;
            const beat = typeof parsed?.beat === "string" ? parsed.beat.trim().toLowerCase() : undefined;
            const pitfall = typeof parsed?.pitfall === "string" ? parsed.pitfall.trim().toLowerCase() : undefined;
            rows.push({ id, scene, beat, pitfall });
        } catch (err) {
            console.warn(`[cut-games] Skipping practice row: ${(err as Error).message}`);
        }
    }
    return rows;
}

function trimBOM(content: string): string {
    if (content.charCodeAt(0) === 0xfeff) return content.slice(1);
    return content;
}

export default router;
