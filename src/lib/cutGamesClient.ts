// src/lib/cutGamesClient.ts
import { apiBase } from "./apiBase";

const withApiBase = (path: string) => `${apiBase}${path.startsWith("/") ? path : `/${path}`}`;

export type PracticeItem = { id:number; scene:string; beat?:string; pitfall?:string };

async function get<T>(url: string): Promise<T> {
  const target = withApiBase(url);
  const res = await fetch(target, { credentials: "include" });
  if (!res.ok) throw new Error(`GET ${url} failed: ${res.status}`);
  return res.json();
}

async function post<T>(url: string, body: any): Promise<T> {
  const target = withApiBase(url);
  const res = await fetch(target, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`POST ${url} failed: ${res.status}`);
  return res.json();
}

export async function fetchCatalog() { return get<any>("/cut-games/catalog"); }
export async function fetchBeats() { return get<any>("/cut-games/beats"); }
export async function fetchIntroductions() { return get<any>("/cut-games/introductions"); }

export async function fetchPractice(params: {mode:"good"|"bad"; beat?:string; pitfall?:string;}): Promise<PracticeItem[]> {
  const qs = new URLSearchParams();
  qs.set("mode", params.mode);
  if (params.beat) qs.set("beat", params.beat);
  if (params.pitfall) qs.set("pitfall", params.pitfall);
  return get<PracticeItem[]>(`/cut-games/practice?${qs.toString()}`);
}

export async function sendTelemetrySkip(mode:"good"|"bad", meta: { beat?:string; pitfall?:string; type?: "lesson"|"prompt"|"mixed"|"notelesson" } = {}) {
  return post<{ok:true}>("/cut-games/telemetry", { event:"skip", mode, meta });
}

export type RoundItemAnswer = { itemId:number; mode:string; beat?:string; pitfall?:string; answer?:string; skipped:boolean };

export async function submitRound(payload: {
  mode: "Name"|"Missing"|"Fix"|"Order"|"Highlight"|"Why";
  beat?: string;
  pitfall?: string;
  items: RoundItemAnswer[];
  startedAt: string;
  finishedAt: string;
}) {
  return post<{ ok:true; id:string; score:number; rubric:{ score:number; notes:string[]; flags:any } }>("/api/submit", payload);
}
