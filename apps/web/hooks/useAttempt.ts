import { useState } from "react";

export function useAttempt(mode: string, userId = "dev") {
  const [result, setResult] = useState<any>(null);
  const [isLoading, setLoading] = useState(false);
  const [current, setCurrent] = useState<any>(null);

  const loadNext = async () => {
    const r = await fetch(`/api/next`, { headers: { "x-user-id": userId } });
    const j = await r.json();
    setCurrent(j);
    setResult(null);
    return j;
  };

  const submit = async (itemId: string, answer: any) => {
    setLoading(true);
    const r = await fetch("/api/attempt", {
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
    const r = await fetch(`/api/reports/latest`, { headers: { "x-user-id": userId } });
    return r.json();
  };

  const skip = async (itemId?: string) => {
    if (!itemId) return;
    await fetch("/api/skip", {
      method: "POST",
      headers: { "content-type": "application/json", "x-user-id": userId },
      body: JSON.stringify({ userId, itemId, mode, reason: "user_skip" }),
    });
    return loadNext();
  };

  return { current, loadNext, submit, result, isLoading, latestReport, skip };
}
