import { z } from "zod";

export type WordEntry = {
  word: string;
  from: { language: string; root: string; gloss: string };
  literal: string;
};

export type ValidationIssue = string;

export type ValidationResult = {
  entries: WordEntry[];
  items: WordEntry[];
  issues: ValidationIssue[];
};

const WordEntrySchema = z.object({
  word: z.string().min(1),
  from: z.object({
    language: z.string(),
    root: z.string(),
    gloss: z.string(),
  }),
  literal: z.string(),
});

const RESERVED_KEYS = new Set([
  "id",
  "label",
  "title",
  "name",
  "description",
  "meta",
  "version",
  "type",
]);

function asString(value: unknown): string | undefined {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return undefined;
}

function coerceWord(record: Record<string, unknown>): string | undefined {
  return (
    asString(record.word) ??
    asString(record.term) ??
    asString(record.key) ??
    asString(record.name) ??
    asString(record.id) ??
    asString(record.slug)
  );
}

function collectArrayFromObject(obj: Record<string, unknown>): unknown[] | undefined {
  const candidateKeys = [
    "entries",
    "items",
    "words",
    "data",
    "list",
    "values",
    "value",
    "lines",
    "records",
    "rows",
    "docs",
  ];

  for (const key of candidateKeys) {
    const maybe = obj[key];
    if (Array.isArray(maybe)) return maybe;
  }

  const nestedArrays = Object.entries(obj)
    .filter(([key]) => !RESERVED_KEYS.has(key))
    .map(([, value]) => value)
    .filter(Array.isArray) as unknown[][];

  if (nestedArrays.length === 1) return nestedArrays[0];

  if (!Object.keys(obj).length) return [];

  const candidateEntries = Object.entries(obj).filter(([key]) => !RESERVED_KEYS.has(key));
  if (!candidateEntries.length) return undefined;

  return candidateEntries.map(([key, value]) => {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return { word: key, ...(value as Record<string, unknown>) };
    }
    if (Array.isArray(value)) return value;
    const literal = asString(value);
    return { word: key, literal: literal ?? key };
  });
}

function normalizeEntry(entry: unknown, index: number, issues: string[]): WordEntry | null {
  const prefix = `Entry #${index + 1}`;

  if (typeof entry === "string") {
    const word = entry.trim();
    if (!word) {
      issues.push(`${prefix}: Empty string entry`);
      return null;
    }
    return { word, from: { language: "", root: "", gloss: word }, literal: word };
  }

  if (Array.isArray(entry)) {
    if (!entry.length) {
      issues.push(`${prefix}: Empty array entry`);
      return null;
    }
    const [wordRaw, literalRaw] = entry;
    const word = asString(wordRaw);
    if (!word) {
      issues.push(`${prefix}: Missing word in tuple entry`);
      return null;
    }
    const literal = asString(literalRaw) ?? word;
    return {
      word,
      from: { language: "", root: "", gloss: literal },
      literal,
    };
  }

  if (entry && typeof entry === "object") {
    const record = entry as Record<string, unknown>;
    const word = coerceWord(record);
    if (!word) {
      issues.push(`${prefix}: Missing word property`);
      return null;
    }

    const fromSource = (record.from && typeof record.from === "object" && !Array.isArray(record.from))
      ? (record.from as Record<string, unknown>)
      : undefined;

    const language = asString(fromSource?.language ?? record.language ?? record.lang) ?? "";
    const root = asString(fromSource?.root ?? record.root ?? record.stem ?? record.origin) ?? "";
    const literalRaw =
      asString(record.literal) ??
      asString(record.definition) ??
      asString(record.meaning) ??
      asString(record.gloss) ??
      asString(record.text) ??
      asString(record.value);

    const gloss =
      asString(fromSource?.gloss ?? record.gloss ?? record.definition ?? record.meaning ?? record.literal) ??
      literalRaw ??
      word;

    const literal = literalRaw ?? gloss ?? word;

    const candidate: WordEntry = {
      word,
      from: {
        language,
        root,
        gloss,
      },
      literal,
    };

    const parsed = WordEntrySchema.safeParse(candidate);
    if (parsed.success) return parsed.data;
    issues.push(`${prefix}: ${parsed.error.issues.map((i) => i.message).join(", ")}`);
    return null;
  }

  issues.push(`${prefix}: Unsupported entry type (${typeof entry})`);
  return null;
}

export default function validateAndNormalize(raw: unknown): ValidationResult {
  const issues: string[] = [];
  let source: unknown = raw;

  if (!source || typeof source !== "object" || Array.isArray(source)) {
    issues.push("Top-level data was not an object; coercion expected before validation.");
    source = {};
  }

  const obj = source as Record<string, unknown>;
  const array = collectArrayFromObject(obj) ?? [];

  if (!array.length) {
    issues.push("No entries/items array found in pack data.");
  }

  const entries: WordEntry[] = [];
  array.forEach((item, index) => {
    const normalized = normalizeEntry(item, index, issues);
    if (normalized) entries.push(normalized);
  });

  return { entries, items: entries, issues };
}

export { WordEntrySchema };
