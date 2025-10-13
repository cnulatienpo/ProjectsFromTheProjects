import { z } from "zod";

export const ProgressExportSchema = z.object({
  version: z.literal(1),
  exportedAtISO: z.string().datetime(),
  points: z.number().int().nonnegative(),
  seenKeys: z.array(z.string()),
  usedKeys: z.array(z.string()),
});
export type ProgressExport = z.infer<typeof ProgressExportSchema>;

export function serializeProgress(src: {
  points: number;
  seen: Record<string, true>;
  used: Record<string, true>;
}): ProgressExport {
  return {
    version: 1,
    exportedAtISO: new Date().toISOString(),
    points: Math.max(0, src.points | 0),
    seenKeys: Object.keys(src.seen || {}).sort(),
    usedKeys: Object.keys(src.used || {}).sort(),
  };
}

export function downloadJSON(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function readJSONFile(file: File): Promise<unknown> {
  const text = await file.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error("Invalid JSON file.");
  }
}
