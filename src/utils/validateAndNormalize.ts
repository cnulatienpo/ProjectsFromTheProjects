import { z } from 'zod';

export const WordEntrySchema = z.object({
  word: z.string(),
  from: z.object({
    language: z.string(),
    root: z.string(),
    gloss: z.string(),
  }),
  literal: z.string(),
});

export const PackSchema = z.object({
  entries: z.array(WordEntrySchema),
});

export default function validateAndNormalize(fileName: string, raw: unknown) {
  let entries: any[] = [];
  let issues: string[] = [];

  // Accept either array or { entries: [...] }
  if (Array.isArray(raw)) {
    const result = z.array(WordEntrySchema).safeParse(raw);
    if (result.success) {
      entries = result.data;
    } else {
      issues = Object.values(result.error.format());
    }
  } else if (typeof raw === 'object' && raw !== null && 'entries' in raw) {
    const result = PackSchema.safeParse(raw);
    if (result.success) {
      entries = result.data.entries;
    } else {
      issues = Object.values(result.error.format());
    }
  } else {
    issues.push(`Invalid format in ${fileName}: must be array or { entries: [...] }`);
  }

  return { entries, issues };
}
