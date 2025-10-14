import { safeJSONParse, stripBOM } from "./safeJson";

type AnyObj = Record<string, any>;

/**
 * Coerce raw sources (string | array | object) into an object your validator can accept.
 * Minimum contract: return an object; never throw.
 */
export function ensurePackObject(raw: unknown): AnyObj {
  // 1) Already an object?
  if (raw && typeof raw === "object" && !Array.isArray(raw)) return raw as AnyObj;

  // 2) Array -> wrap
  if (Array.isArray(raw)) return { items: raw };

  // 3) Strings -> try JSON first
  if (typeof raw === "string") {
    const s = stripBOM(raw).trim();

    // JSON?
    const json = safeJSONParse<unknown>(s);
    if (json.ok) {
      const v = json.value as any;
      if (v && typeof v === "object") return v;
      if (Array.isArray(v)) return { items: v };
      return { value: v };
    }

    // JSONL?
    if (s.includes("\n{") || s.includes("}\n")) {
      const lines = s.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      const items = lines.map(line => {
        const p = safeJSONParse<any>(line);
        return p.ok ? p.value : { value: line };
      });
      return { items };
    }

    // Simple TSV/CSV-ish (word|definition or word\tdefinition)
    if (s.includes("|") || s.includes("\t") || s.includes(",")) {
      const rows = s.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      const items = rows.map(row => {
        const parts = row.split(/\s*\|\s*|\t|,/, 2);
        if (parts.length === 2) return { term: parts[0], definition: parts[1] };
        return { value: row };
      });
      return { items };
    }

    // Markdown fallback: take lines that look like "- term: def"
    if (s.startsWith("#") || s.includes("\n- ")) {
      const items = s.split(/\r?\n/).map(l => l.replace(/^[#\-\*\s]+/, "").trim())
        .filter(Boolean).map(line => ({ value: line }));
      return { items };
    }

    // Last resort: wrap
    return { value: s };
  }

  // 4) numbers/booleans/null/undefined -> wrap
  return { value: raw as any };
}
