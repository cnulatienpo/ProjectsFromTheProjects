// Vite will inline these at build. We use { as: "raw" } to get strings for non-JSON files.
const globsRaw = {
  // strings for md/txt/jsonl; JSON will still come as string here (we treat uniformly)
  gameThingss: import.meta.glob("/game thingss/**/*.{json,jsonl,txt,md}", { as: "raw", eager: true }),
  labeledData: import.meta.glob("/labeled data/**/*.{json,jsonl,txt,md}", { as: "raw", eager: true }),
  labeledDataAlt: import.meta.glob("/labeled data/**/*.{json,jsonl,txt,md}", { as: "raw", eager: true }),
};

// Also try module JSON (in case some packs are valid JSON modules in src/)
const globsJson = {
  srcJson: import.meta.glob("/src/**/*.{json}", { eager: true }),
};

export type RawPackEntry = { path: string; content: unknown };

export function collectRawPacks(): RawPackEntry[] {
  const list: RawPackEntry[] = [];

  for (const [path, content] of Object.entries(globsRaw.gameThingss)) list.push({ path, content });
  for (const [path, content] of Object.entries(globsRaw.labeledData)) list.push({ path, content });
  for (const [path, content] of Object.entries(globsRaw.labeledDataAlt)) list.push({ path, content });
  for (const [path, content] of Object.entries(globsJson.srcJson)) list.push({ path, content });

  // De-dupe by path (last one wins)
  const seen = new Map<string, RawPackEntry>();
  for (const e of list) seen.set(e.path, e);
  return Array.from(seen.values());
}
