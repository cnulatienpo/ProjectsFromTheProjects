type Json = any;

function jsonResponse(body: Json, init: number | ResponseInit = 200) {
    const status = typeof init === "number" ? init : (init as ResponseInit).status ?? 200;
    const headers = new Headers(typeof init === "number" ? {} : (init as ResponseInit).headers);
    if (!headers.has("content-type")) headers.set("content-type", "application/json; charset=utf-8");
    return new Response(JSON.stringify(body), { status, headers });
}

async function handleLocalRagCheck(req: Request) {
    const q = await req.json().catch(() => ({} as any));
    const text: string = q?.text ?? "";
    const hasMetaphor = /\blike a\b|\bas if\b| as .* as /i.test(text);
    const hasReversal = /\bbut\b|\bhowever\b|\byet\b/i.test(text);
    const len = text.trim().length;

    const dims = [
        { name: "Voice", score: hasMetaphor ? 0.7 : 0.5, rationale: hasMetaphor ? "Metaphoric texture present." : "Add sensory rhythm." },
        { name: "Structure", score: hasReversal ? 0.7 : 0.45, rationale: hasReversal ? "Clear turn detected." : "Insert a reversal to raise stakes." },
        { name: "Devices", score: hasMetaphor ? 0.65 : 0.4, rationale: hasMetaphor ? "Device used; echo motif twice." : "Layer one deliberate device." },
        { name: "Clarity", score: len > 120 ? 0.6 : 0.4, rationale: len > 120 ? "Enough context to parse action." : "Add grounding details." }
    ];
    const overall = dims.reduce((a, d) => a + d.score, 0) / dims.length;
    const tips = [
        "Open on a concrete image in the first 2 sentences.",
        "Place one reversal near the midpoint.",
        "Choose a single device (metaphor or motif) and echo it twice."
    ];

    return jsonResponse({
        overall,
        dimensions: dims,
        flags: [],
        tips,
        citations: [],
        evidence: [],
        model: "offline-shim",
        debug: { usedOfflineMock: true }
    });
}

/** Intercept fetch('/api/...') and serve from public/ or compute locally. Idempotent. */
export function installApiShim() {
    if ((window as any).__LD_API_SHIM_INSTALLED__) return;
    (window as any).__LD_API_SHIM_INSTALLED__ = true;

    const origFetch = window.fetch.bind(window);

    window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
        const url = typeof input === "string" ? input : (input as URL).toString();
        const isApi = /^\/api\//.test(url);
        if (!isApi) return origFetch(input as any, init);

        // /api/version
        if (url === "/api/version") {
            return jsonResponse({ name: "Literary Deviousness (static)", env: "pages", ts: new Date().toISOString() });
        }
        // /api/flags (GET/POST)
        if (url === "/api/flags") {
            const key = "ld:flags";
            if ((init?.method ?? "GET").toUpperCase() === "POST") {
                const body = await (async () => { try { return JSON.parse(String(init?.body ?? "{}")); } catch { return {}; } })();
                const current = JSON.parse(localStorage.getItem(key) || '{"gameEnabled":true,"maintenanceMessage":""}');
                const next = { ...current, ...(body || {}) };
                localStorage.setItem(key, JSON.stringify(next));
                return jsonResponse({ flags: next });
            } else {
                const flags = JSON.parse(localStorage.getItem(key) || '{"gameEnabled":true,"maintenanceMessage":""}');
                return jsonResponse({ flags });
            }
        }
        // /api/rag/check
        if (url === "/api/rag/check") {
            return handleLocalRagCheck(new Request(url, init));
        }
        // /api/meta/* → serve static JSON from /public/api/meta/*.json
        if (url.startsWith("/api/meta/")) {
            const file = url.endsWith(".json") ? url : `${url}.json`;
            return origFetch(file, { cache: "no-store" });
        }

        return jsonResponse({ error: "Not Found (static shim)" }, 404);
    };
}
