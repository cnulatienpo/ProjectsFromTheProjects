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

// In some environments import.meta.glob isn't typed/available. We avoid relying on it
// and instead fetch the public JSONL in dev or use the bundled import when available.
const jsonlRawImport = {} as Record<string, string>;

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
  // First, try the common public path (works in dev when file is in `public/data/...`)
  let rawText: string | undefined = undefined;
  try {
    // eslint-disable-next-line no-await-in-loop
    const r = await fetch('/data/cut_games/tweetrunk_renumbered.jsonl', { headers: { Accept: 'text/plain' } });
    if (r.ok) {
      // eslint-disable-next-line no-await-in-loop
      const txt = await r.text();
      // Vite may return the SPA index.html if the file isn't present in the app's public folder.
      if (txt && txt.length && !txt.trim().startsWith('<')) rawText = txt;
    }
  } catch {
    // ignore
  }

  // If the public fetch didn't succeed, try the bundled import (if available) and other fallbacks
  if (!rawText) {
    const mod = Object.values(jsonlRawImport)[0] as unknown as string | undefined;
    if (mod) {
      rawText = mod as string;
    } else {
      // Fallback: try fetching from public paths that may be available in dev
      const candidates = [
        '/data/cut_games/tweetrunk_renumbered.jsonl',
        '/public/data/cut_games/tweetrunk_renumbered.jsonl',
        '/labeled%20data/tweetrunk_renumbered.jsonl',
        '/labeled data/tweetrunk_renumbered.jsonl',
      ];
      for (const url of candidates) {
        try {
          // attempt to fetch; ignore failures
          // eslint-disable-next-line no-await-in-loop
          const r = await fetch(url, { headers: { Accept: 'text/plain' } });
          if (!r.ok) continue;
          // eslint-disable-next-line no-await-in-loop
          const txt = await r.text();
          if (txt && txt.length) {
            rawText = txt;
            break;
          }
        } catch {
          // ignore
        }
      }
      // Last resort: fetch the workspace file via Vite's /@fs/ file-system URL (dev-only)
      if (!rawText) {
        try {
          const fsUrl = '/@fs/workspaces/ProjectsFromTheProjects/public/data/cut_games/tweetrunk_renumbered.jsonl';
          // eslint-disable-next-line no-await-in-loop
          const r2 = await fetch(fsUrl, { headers: { Accept: 'text/plain' } });
          if (r2.ok) {
            // eslint-disable-next-line no-await-in-loop
            const txt2 = await r2.text();
            if (txt2 && txt2.length) rawText = txt2;
          }
        } catch {
          // ignore
        }
      }
    }
  }
  if (!rawText) return null;
  const rows = parseJSONL(rawText);
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
