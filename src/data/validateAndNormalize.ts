import { z } from 'zod';
import type { WordEntry } from './wordTypes';

export type { WordEntry } from './wordTypes';

type ValidationResult = {
  entries: WordEntry[];
  issues: string[];
};

const wordEntrySchema = z.object({
  word: z.string(),
  from: z.object({
    language: z.string(),
    root: z.string(),
    gloss: z.string(),
  }),
  literal: z.string(),
});

const arrayPackSchema = z.array(wordEntrySchema);
const objectPackSchema = z.object({ entries: arrayPackSchema });

function collapseWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ');
}

function normalizeWord(value: string): string {
  return collapseWhitespace(value.trim()).normalize('NFC');
}

function normalizeField(value: string): string {
  return collapseWhitespace(value.trim());
}

type ExtractResult = { entries: unknown[] | null; error?: string };

function extractEntries(raw: unknown): ExtractResult {
  if (arrayPackSchema.safeParse(raw).success) {
    return { entries: raw as unknown[] };
  }

  if (objectPackSchema.safeParse(raw).success) {
    return { entries: (raw as { entries: unknown[] }).entries };
  }

  if (raw && typeof raw === 'object' && 'default' in (raw as Record<string, unknown>)) {
    return extractEntries((raw as { default: unknown }).default);
  }

  if (Array.isArray(raw)) {
    return { entries: raw };
  }

  if (raw && typeof raw === 'object' && Array.isArray((raw as { entries?: unknown[] }).entries)) {
    return { entries: (raw as { entries: unknown[] }).entries };
  }

  return { entries: null, error: 'expected an array of entries or an object with an entries array' };
}

export function validateAndNormalizePack(fileName: string, raw: unknown): ValidationResult {
  const { entries, error } = extractEntries(raw);
  const issues: string[] = [];

  if (!entries) {
    issues.push(`[${fileName}] dropped row 0: ${error ?? 'unrecognized pack format'}`);
    return { entries: [], issues };
  }

  const normalizedEntries: WordEntry[] = [];

  entries.forEach((candidate, index) => {
    const rowNumber = index + 1;
    const parsed = wordEntrySchema.safeParse(candidate);

    if (!parsed.success) {
      const reason =
        parsed.error.issues
          .map((issue) => {
            const path = issue.path.length ? issue.path.join('.') : 'entry';
            return `${path}: ${issue.message}`;
          })
          .join('; ') || 'invalid entry';
      issues.push(`[${fileName}] dropped row ${rowNumber}: ${reason}`);
      return;
    }

    const entry = parsed.data;
    const normalized: WordEntry = {
      word: normalizeWord(entry.word),
      from: {
        language: normalizeField(entry.from.language),
        root: normalizeField(entry.from.root),
        gloss: normalizeField(entry.from.gloss),
      },
      literal: normalizeField(entry.literal),
    };

    if (!normalized.word) {
      issues.push(`[${fileName}] dropped row ${rowNumber}: word is empty after trimming`);
      return;
    }

    if (!normalized.from.language || !normalized.from.root || !normalized.from.gloss) {
      issues.push(`[${fileName}] dropped row ${rowNumber}: missing language/root/gloss`);
      return;
    }

    if (!normalized.literal) {
      issues.push(`[${fileName}] dropped row ${rowNumber}: literal is empty after trimming`);
      return;
    }

    normalizedEntries.push(normalized);
  });

  return { entries: normalizedEntries, issues };
}
