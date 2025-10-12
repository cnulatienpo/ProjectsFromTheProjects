export interface PracticeQuery {
    mode: "good" | "bad";
    beat?: string;
    pitfall?: string;
}

export async function fetchCatalog<T = unknown>(): Promise<T> {
    const res = await fetchJson("/cut-games/catalog");
    return res as T;
}

export async function fetchBeats<T = unknown>(): Promise<T> {
    const res = await fetchJson("/cut-games/beats");
    return res as T;
}

export async function fetchIntroductions<T = unknown>(): Promise<T> {
    const res = await fetchJson("/cut-games/introductions");
    return res as T;
}

export async function fetchPractice<T = any[]>(query: PracticeQuery): Promise<T> {
    const params = new URLSearchParams();
    params.set("mode", query.mode);
    if (query.beat) params.set("beat", query.beat);
    if (query.pitfall) params.set("pitfall", query.pitfall);
    const res = await fetchJson(`/cut-games/practice?${params.toString()}`);
    return res as T;
}

async function fetchJson(url: string): Promise<unknown> {
    const response = await fetch(url, { headers: { "accept": "application/json" }, cache: "no-store" });
    if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.status}`);
    }
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json") || contentType.includes("application/x-ndjson")) {
        return response.json();
    }
    return response.json();
}
