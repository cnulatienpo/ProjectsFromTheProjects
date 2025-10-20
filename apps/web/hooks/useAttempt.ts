import { useState } from "react";

export function useAttempt(mode: string, userId = "dev") {
  const [result, setResult] = useState<any>(null);
  const [isLoading, setLoading] = useState(false);
  const submit = async (itemId: string, answer: any) => {
    setLoading(true);
    const r = await fetch("/api/attempt", {
      method: "POST",
      headers: { "content-type": "application/json", "x-user-id": userId },
      body: JSON.stringify({ userId, itemId, mode, answer }),
    });
    const j = await r.json(); setResult(j); setLoading(false);
  };
  const next = async () => {
    const r = await fetch(`/api/next`, { headers: { "x-user-id": userId } });
    return r.json();
  };
  const latestReport = async () => {
    const r = await fetch(`/api/reports/latest`, { headers: { "x-user-id": userId } });
    return r.json();
  };
  return { submit, result, isLoading, next, latestReport };
}
