import path from "node:path";
import { promises as fsp } from "node:fs";

export interface ShadowData {
    players: Record<string, PlayerEntry>;
}

export interface PlayerEntry {
    counter: number;
    skips: {
        beat: Record<string, number>;
        pitfall: Record<string, number>;
        type: Record<string, number>;
    };
    lastUpdated: string;
}

export interface SkipMeta {
    beat?: string | null;
    pitfall?: string | null;
    type?: string | null;
}

export interface IncomingContext {
    beat?: string;
    pitfall?: string;
    mode: "good" | "bad";
}

export type ShadowDimension = "beat" | "pitfall" | "type";

const dataDir = path.resolve(process.cwd(), "src", "server", "data");
const dataFile = path.join(dataDir, "shadow_stack.json");

const EMPTY_STORE: ShadowData = { players: {} };

export async function loadShadowStore(): Promise<ShadowData> {
    await ensureDataDir();
    try {
        const raw = await fsp.readFile(dataFile, "utf8");
        const parsed = JSON.parse(raw) as ShadowData | null;
        if (!parsed || typeof parsed !== "object" || !parsed.players) throw new Error("invalid");
        return normalizeStore(parsed);
    } catch {
        const data = cloneStore(EMPTY_STORE);
        await saveShadowStore(data);
        return data;
    }
}

export async function saveShadowStore(data: ShadowData): Promise<void> {
    await ensureDataDir();
    const payload = JSON.stringify(data, null, 2);
    await fsp.writeFile(dataFile, payload, "utf8");
}

export function getOrCreatePlayer(data: ShadowData, playerId: string): PlayerEntry {
    const key = playerId || "anonymous";
    if (!data.players[key]) {
        data.players[key] = createEmptyPlayer();
    } else {
        normalizePlayer(data.players[key]);
    }
    return data.players[key];
}

export function bumpCounter(player: PlayerEntry): void {
    player.counter = Math.max(0, Number.isFinite(player.counter) ? Math.floor(player.counter) : 0) + 1;
    player.lastUpdated = new Date().toISOString();
}

export function recordSkip(player: PlayerEntry, meta: SkipMeta): void {
    if (!meta) return;
    const beat = normalizeKey(meta.beat);
    const pitfall = normalizeKey(meta.pitfall);
    const type = normalizeKey(meta.type);
    if (beat) incrementMap(player.skips.beat, beat);
    if (pitfall) incrementMap(player.skips.pitfall, pitfall);
    if (type) incrementMap(player.skips.type, type);
    player.lastUpdated = new Date().toISOString();
}

export function pickShadowTarget(
    player: PlayerEntry,
    incoming: IncomingContext,
): { dimension: ShadowDimension; key: string } | null {
    const beatQuery = normalizeKey(incoming.beat);
    const pitfallQuery = normalizeKey(incoming.pitfall);
    const mode = incoming.mode;

    const order: ShadowDimension[] = [];
    if (pitfallQuery && mode === "bad") order.push("pitfall");
    if (beatQuery) order.push("beat");

    const totals = {
        pitfall: sumMap(player.skips.pitfall),
        beat: sumMap(player.skips.beat),
        type: sumMap(player.skips.type),
    };

    const dimensions: ShadowDimension[] = ["pitfall", "beat", "type"];
    const sortedByTotal = dimensions
        .filter(d => !(order as ShadowDimension[]).includes(d))
        .filter(d => (d !== "pitfall" || mode === "bad"))
        .sort((a, b) => totals[b] - totals[a]);

    for (const dim of [...order, ...sortedByTotal]) {
        const map = player.skips[dim];
        const key = weightedPick(map);
        if (key) return { dimension: dim, key };
    }

    return null;
}

export function weightedPick(map: Record<string, number>): string | null {
    const entries = Object.entries(map || {}).filter(([, value]) => Number.isFinite(value) && value > 0);
    if (!entries.length) return null;
    const total = entries.reduce((sum, [, value]) => sum + value, 0);
    if (total <= 0) return null;
    let pick = Math.random() * total;
    for (const [key, value] of entries) {
        pick -= value;
        if (pick <= 0) return key;
    }
    return entries[entries.length - 1][0];
}

function createEmptyPlayer(): PlayerEntry {
    return {
        counter: 0,
        skips: { beat: {}, pitfall: {}, type: {} },
        lastUpdated: new Date().toISOString(),
    };
}

function ensureDataDir() {
    return fsp.mkdir(dataDir, { recursive: true });
}

function incrementMap(map: Record<string, number>, key: string) {
    map[key] = Math.max(0, Number.isFinite(map[key]) ? Math.floor(map[key]) : 0) + 1;
}

export function normalizeKey(value?: string | null): string | null {
    if (!value) return null;
    const trimmed = value.trim().toLowerCase();
    return trimmed ? trimmed : null;
}

function normalizeStore(store: ShadowData): ShadowData {
    const clone = cloneStore(store);
    for (const playerId of Object.keys(clone.players)) {
        const entry = clone.players[playerId];
        normalizePlayer(entry);
    }
    return clone;
}

function normalizePlayer(player: PlayerEntry) {
    player.counter = Math.max(0, Number.isFinite(player.counter) ? Math.floor(player.counter) : 0);
    if (!player.skips) {
        player.skips = { beat: {}, pitfall: {}, type: {} };
    }
    for (const dimension of ["beat", "pitfall", "type"] as const) {
        const map = player.skips[dimension] ?? {};
        const normalized: Record<string, number> = {};
        for (const [key, value] of Object.entries(map)) {
            const normKey = normalizeKey(key);
            if (!normKey) continue;
            const numValue = Number.isFinite(value) ? Math.floor(value) : 0;
            if (numValue > 0) normalized[normKey] = numValue;
        }
        player.skips[dimension] = normalized;
    }
    if (!player.lastUpdated) {
        player.lastUpdated = new Date().toISOString();
    }
}

function sumMap(map: Record<string, number>): number {
    let total = 0;
    for (const value of Object.values(map || {})) {
        if (Number.isFinite(value) && value > 0) total += value;
    }
    return total;
}

function cloneStore(store: ShadowData): ShadowData {
    return {
        players: Object.fromEntries(
            Object.entries(store.players ?? {}).map(([id, entry]) => [id, clonePlayer(entry)]),
        ),
    };
}

function clonePlayer(entry: PlayerEntry): PlayerEntry {
    return {
        counter: entry?.counter ?? 0,
        skips: {
            beat: { ...(entry?.skips?.beat ?? {}) },
            pitfall: { ...(entry?.skips?.pitfall ?? {}) },
            type: { ...(entry?.skips?.type ?? {}) },
        },
        lastUpdated: entry?.lastUpdated ?? new Date().toISOString(),
    };
}
