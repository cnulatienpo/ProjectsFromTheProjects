import validateAndNormalize, { type ValidationResult, type WordEntry } from "@/utils/validateAndNormalize";
import { ensurePackObject } from "@/utils/ensurePackObject";
import { collectRawPacks } from "./packSources";

export type { WordEntry } from "@/utils/validateAndNormalize";

export type Pack = {
  id: string;
  label: string;
  file: string;
  entries: WordEntry[];
  meta: { dropped: number; dupes: number };
};

function slugFromFile(filePath: string): string {
  const name = filePath.split("/").pop() || filePath;
  const m = name.match(/pack-(\d+)[^-]*/i);
  return m ? `pack-${m[1]}` : name.replace(/\.[^.]+$/i, "");
}

function labelFromFile(filePath: string): string {
  const name = filePath.split("/").pop()?.replace(/\.[^.]+$/i, "") || filePath;
  return name.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export async function loadAllPacksSafe(): Promise<{ packs: Pack[]; report: string[]; total: number }> {
  const rawEntries = collectRawPacks();

  if (!rawEntries.length) {
    console.warn("[GoodWord] No pack files found under 'game thingss/' or 'labeled data/'. Check paths & filenames.");
  }

  const packs: Pack[] = [];
  const report: string[] = [];
  let grandTotal = 0;

  for (const { path, content } of rawEntries) {
    const asObj = ensurePackObject(content);

    let normalized: ValidationResult;
    try {
      normalized = validateAndNormalize(asObj);
    } catch (e: any) {
      console.groupCollapsed(`[GoodWord] Pack validation failed @ ${path}`);
      console.log("Raw content (preview):", typeof content === "string" ? content.slice(0, 240) : content);
      console.log("Coerced object:", asObj);
      console.error("Validation error:", e?.message || e);
      console.groupEnd();
      continue;
    }

    const seen = new Set<string>();
    const deduped: WordEntry[] = [];
    let dupes = 0;
    for (const entry of normalized.entries) {
      const key = entry.word.toLocaleLowerCase();
      if (seen.has(key)) {
        dupes += 1;
        continue;
      }
      seen.add(key);
      deduped.push(entry);
    }

    deduped.sort((a, b) => a.word.localeCompare(b.word, undefined, { sensitivity: "base" }));

    packs.push({
      id: slugFromFile(path),
      label: labelFromFile(path),
      file: path,
      entries: deduped,
      meta: { dropped: normalized.issues.length, dupes },
    });

    grandTotal += deduped.length;

    const first = deduped[0]?.word ?? "—";
    const last = deduped[deduped.length - 1]?.word ?? "—";
    report.push(
      `${path.split("/").pop()}: count=${deduped.length}, dropped=${normalized.issues.length}, dupes=${dupes}, first="${first}", last="${last}"`
    );
    if (normalized.issues.length) {
      for (const msg of normalized.issues) {
        report.push(`  • ${msg}`);
      }
    }
  }

  packs.sort((a, b) => {
    const na = parseInt(a.id.replace(/\D/g, "") || "0", 10);
    const nb = parseInt(b.id.replace(/\D/g, "") || "0", 10);
    return na - nb || a.id.localeCompare(b.id);
  });

  if (!packs.length) {
    console.error("[GoodWord] No valid packs loaded. Falling back to empty array.");
  }

  return { packs, report, total: grandTotal };
}

export async function loadAllPacks(): Promise<Pack[]> {
  const { packs } = await loadAllPacksSafe();
  return packs;
}

export function reportPackHealth(packs: Pack[], report: string[]): void {
  const rows = packs.map((p) => ({
    id: p.id,
    label: p.label,
    entries: p.entries.length,
    dropped: p.meta.dropped,
    dupes: p.meta.dupes,
    first: p.entries[0]?.word ?? "—",
    last: p.entries[p.entries.length - 1]?.word ?? "—",
  }));
  console.table(rows);
  for (const line of report) console.log(line);
  const total = rows.reduce((n, r) => n + r.entries, 0);
  console.log("TOTAL ENTRIES:", total);
}

export function assertMinimum(total: number, min: number): void {
  if (total < min) {
    const msg = [
      `Not enough entries: have ${total}, need at least ${min}.`,
      '• Make sure your JSON packs are in /src/labeled-data and end with ".json".',
      '• Only arrays or { entries: [...] } are accepted.',
      '• Use "npm i zod" and our validator to drop bad rows safely.',
    ].join("\n");
    throw new Error(msg);
  }
}
