import validateAndNormalize from "@/utils/validateAndNormalize";

type AnyObj = Record<string, any>;

// Try .json first, then .ts export fallback.
const jsonMods = import.meta.glob("/src/data/sigilSyntaxItems.json", { eager: true }) as Record<string, any>;
const tsMods = import.meta.glob("/src/games/sigilSyntaxItems.{ts,tsx}", { eager: true }) as Record<string, any>;

function pickRaw(): unknown {
  const json = Object.values(jsonMods)[0];
  if (json !== undefined) return json;
  const ts = Object.values(tsMods)[0];
  if (ts && ("default" in ts || "items" in ts)) {
    return (ts as any).default ?? (ts as any).items;
  }
  return undefined;
}

// Coerce strings/arrays → object the validator accepts.
function ensureObject(raw: unknown): AnyObj {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) return raw as AnyObj;
  if (Array.isArray(raw)) return { items: raw };
  if (typeof raw === "string") {
    const s = raw.charCodeAt(0) === 0xfeff ? raw.slice(1) : raw;
    try {
      const p = JSON.parse(s);
      if (p && typeof p === "object" && !Array.isArray(p)) return p as AnyObj;
      if (Array.isArray(p)) return { items: p };
      return { value: p };
    } catch {
      return { value: s.trim() };
    }
  }
  return { value: raw as any };
}

export type SigilItem = { term?: string; definition?: string; [k: string]: any };
export type SigilPack = { items: SigilItem[]; [k: string]: any };

export function loadSigilPackSafe(): SigilPack | null {
  const raw = pickRaw();
  if (raw === undefined) {
    console.warn(
      "[Sigil&Syntax] No data found (looked for src/data/sigilSyntaxItems.json and src/games/sigilSyntaxItems.ts)."
    );
    return null;
  }
  const obj = ensureObject(raw);
  try {
    const normalized = validateAndNormalize(obj) as SigilPack;
    if (!normalized || !Array.isArray(normalized.items)) {
      console.error("[Sigil&Syntax] Normalized pack missing .items array.", normalized);
      return null;
    }
    return normalized;
  } catch (e: any) {
    console.error("[Sigil&Syntax] Validation failed.", obj, e?.message || e);
    return null;
  }
}
