export type PracticeMode = "good" | "bad";

export type PracticeItem = {
  id: number;
  scene: string;
  beat?: string | null;
  pitfall?: string | null;
  type?: string | null;
};

export type CatalogMode = { name: string; desc: string };

export type CatalogBeat = {
  beat: string;
  total: number;
  from_tweetrunk: number;
  from_good: number;
  from_bad: number;
};

export type CutGamesCatalog = {
  tweetrunkCount: number;
  goodCount: number;
  badCount: number;
  beatsIndex: CatalogBeat[];
  lessonsByTagCount: number;
  modes: CatalogMode[];
};

export type IntroductionsIndex = Record<string, number[]>;

type TelemetryType = "lesson" | "prompt" | "mixed" | "notelesson" | (string & {});

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error(`GET ${url} failed: ${res.status}`);
  return res.json() as Promise<T>;
}

async function post<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`POST ${url} failed: ${res.status}`);
  return res.json() as Promise<T>;
}

export async function fetchCatalog(): Promise<CutGamesCatalog> {
  return get<CutGamesCatalog>("/cut-games/catalog");
}

export async function fetchBeats(): Promise<CatalogBeat[]> {
  return get<CatalogBeat[]>("/cut-games/beats");
}

export async function fetchIntroductions(): Promise<IntroductionsIndex> {
  return get<IntroductionsIndex>("/cut-games/introductions");
}

export async function fetchPractice(params: {
  mode: PracticeMode;
  beat?: string;
  pitfall?: string;
}): Promise<PracticeItem[]> {
  const qs = new URLSearchParams();
  qs.set("mode", params.mode);
  if (params.beat) qs.set("beat", params.beat);
  if (params.pitfall) qs.set("pitfall", params.pitfall);
  return get<PracticeItem[]>(`/cut-games/practice?${qs.toString()}`);
}

export async function sendTelemetrySkip(
  mode: PracticeMode,
  meta: { beat?: string; pitfall?: string; type?: TelemetryType } = {}
) {
  return post<{ ok: true }>("/cut-games/telemetry", { event: "skip", mode, meta });
}

export type RoundItemAnswer = {
  itemId: number;
  mode: PracticeMode;
  beat?: string;
  pitfall?: string;
  answer?: string;
  skipped: boolean;
};

export type RoundMode =
  | "Name"
  | "Missing"
  | "Fix"
  | "Order"
  | "Highlight"
  | "Why"
  | (string & {});

export type SubmitRoundRubric = {
  score: number;
  notes: string[];
  flags: Record<string, unknown>;
};

export type SubmitRoundResponse = {
  ok: true;
  id?: string;
  score: number;
  rubric?: SubmitRoundRubric;
  xp?: number;
  level?: number;
  levelUp?: { from: number; to: number } | null;
  newBadges?: Array<{ id: string; title: string; desc: string; xp_bonus?: number }>;
};

export async function submitRound(payload: {
  mode: RoundMode;
  beat?: string;
  pitfall?: string;
  items: RoundItemAnswer[];
  startedAt: string;
  finishedAt: string;
}): Promise<SubmitRoundResponse> {
  return post<SubmitRoundResponse>("/api/submit", payload);
}
