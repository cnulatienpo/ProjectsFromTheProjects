import { useState } from "react";

// Use direct Codespaces URL since proxy isn't working
const API_BASE = window.location.hostname.includes('github.dev')
    ? 'https://animated-carnival-v4g77qwxgvv3p5p5-3002.app.github.dev'
    : '';

export function useAttempt(mode = "name", userId = "dev") {
    const [result, setResult] = useState(null);
    const [isLoading, setLoading] = useState(false);
    const [current, setCurrent] = useState(null);

    const loadNext = async () => {
        const url = `${API_BASE}/api/next`;
        const r = await fetch(url, { headers: { "x-user-id": userId } });
        const j = await r.json();
        setCurrent(j);
        setResult(null);
        return j;
    };

    const submit = async (itemId, answer) => {
        setLoading(true);
        const url = `${API_BASE}/api/attempt`;
        const r = await fetch(url, {
            method: "POST",
            headers: { "content-type": "application/json", "x-user-id": userId },
            body: JSON.stringify({ userId, itemId, mode, answer }),
        });
        const j = await r.json();
        setResult(j);
        setLoading(false);
        return j;
    };

    const latestReport = async () => {
        const url = `${API_BASE}/api/reports/latest`;
        const r = await fetch(url, { headers: { "x-user-id": userId } });
        return r.json();
    };

    const skip = async (itemId) => {
        if (!itemId) return;
        const url = `${API_BASE}/api/skip`;
        await fetch(url, {
            method: "POST",
            headers: { "content-type": "application/json", "x-user-id": userId },
            body: JSON.stringify({ userId, itemId, mode, reason: "user_skip" }),
        });
        return loadNext();
    };

    return { current, loadNext, submit, result, isLoading, latestReport, skip };
}
