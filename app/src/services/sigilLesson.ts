export type Lesson = { id: string; title: string; intro: string; prompt: string };

function splitIntroPrompt(text: string): { intro: string; prompt: string } {
  const t = (text ?? "").toString();
  const marker = /(?:^|\n)\s*Before we start:/i;
  const m = t.search(marker);
  if (m >= 0) {
    return { intro: t.slice(0, m).trim(), prompt: t.slice(m).trim() };
  }
  const parts = t.split(/\n\s*\n/);
  if (parts.length >= 2) {
    const prompt = parts.pop()!.trim();
    const intro = parts.join("\n\n").trim();
    return { intro, prompt };
  }
  return { intro: t.trim(), prompt: "" };
}

async function tryServer(wantId?: string): Promise<Lesson | null> {
  try {
    let lessonId = wantId?.trim();
    if (!lessonId) {
      const cat = await fetch("/sigil/catalog", { headers: { Accept: "application/json" } });
      if (!cat.ok) return null;
      const cjson = await cat.json();
      const first = Array.isArray(cjson?.items) ? cjson.items[0] : null;
      if (!first?.id) return null;
      lessonId = String(first.id);
    }
    const r = await fetch(`/sigil/lesson/${encodeURIComponent(lessonId)}`, {
      headers: { Accept: "application/json" },
    });
    if (!r.ok) return null;
    const l = await r.json();
    if (l?.id && (l.intro ?? l.prompt) !== undefined) {
      return {
        id: String(l.id),
        title: String(l.title ?? "Untitled"),
        intro: String(l.intro ?? ""),
        prompt: String(l.prompt ?? ""),
      };
    }
    return null;
  } catch {
    return null;
  }
}

const jsonlRawImport = import.meta.glob("/labeled data/tweetrunk_renumbered.jsonl", { as: "raw", eager: true });

function parseJSONL(raw: string): any[] {
  const out: any[] = [];
  if (!raw) return out;
  for (const ln of raw.split(/\r?\n/)) {
    const s = ln.trim();
    if (!s || s.startsWith("//")) continue;
    try {
      out.push(JSON.parse(s.replace(/,?$/, "")));
    } catch {
      // ignore malformed rows
    }
  }
  return out;
}

function rowToLesson(row: any, fallbackIndex: number): Lesson {
  const id = String(
    row?.new_id ??
      row?.original_id ??
      row?.id ??
      row?.slug ??
      row?.key ??
      row?.uid ??
      row?.code ??
      row?.hash ??
      row?.guid ??
      `item-${fallbackIndex}`,
  );
  const title = String(
    row?.title ??
      row?.heading ??
      row?.name ??
      row?.label ??
      row?.prompt ??
      row?.text ??
      row?.tweet ??
      row?.tweet_text ??
      row?.full_text ??
      row?.content ??
      row?.body ??
      row?.message ??
      row?.excerpt ??
      row?.line ??
      row?.sentence ??
      `Untitled ${id}`,
  );
  const text = (row?.text ?? "").toString();
  const { intro, prompt } = splitIntroPrompt(text);
  return { id, title, intro, prompt };
}

function fromRawRows(rows: any[], wantId?: string): Lesson | null {
  if (!rows.length) return null;
  if (wantId) {
    const match = rows.find((row, index) => {
      const lessonId = String(
        row?.new_id ??
          row?.original_id ??
          row?.id ??
          row?.slug ??
          row?.key ??
          row?.uid ??
          row?.code ??
          row?.hash ??
          row?.guid ??
          `item-${index}`,
      );
      return lessonId === wantId;
    });
    if (match) {
      const index = rows.indexOf(match);
      return rowToLesson(match, index >= 0 ? index : 0);
    }
  }
  return rowToLesson(rows[0], 0);
}

async function getLessonFromRaw(wantId?: string): Promise<Lesson | null> {
  const mod = Object.values(jsonlRawImport)[0] as unknown as string | undefined;
  if (!mod) return null;
  const rows = parseJSONL(mod);
  const lesson = fromRawRows(rows, wantId);
  return lesson ?? null;
}

export async function getFirstLesson(): Promise<Lesson | null> {
  const fromServer = await tryServer();
  if (fromServer) return fromServer;
  return getLessonFromRaw();
}

export async function getLesson(id?: string): Promise<Lesson | null> {
  const wantId = id?.trim();
  if (!wantId) {
    return getFirstLesson();
  }
  const fromServer = await tryServer(wantId);
  if (fromServer) return fromServer;
  return getLessonFromRaw(wantId);
}
