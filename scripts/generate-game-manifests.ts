import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { discoverGames, type Buckets } from "../src/games/discovery";

const DEFAULT_HINT_PATTERNS: Record<string, RegExp> = {
  home: /(home|index|start|menu|hub)/i,
  play: /(play|game|round|board|grid|letters|word|scene)/i,
  rules: /(rules|help|how|about|tutorial)/i,
};

const ORIGINAL_EXTRA_HINTS: Record<string, RegExp> = {
  sigil: /sigil/i,
  syntax: /syntax/i,
  scene: /scene/i,
  order: /order/i,
};

type Manifest = {
  generatedAt: string;
  files: string[];
  hints: Record<string, string[]>;
};

function buildHints(files: string[], patterns: Record<string, RegExp>): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  for (const [key, regex] of Object.entries(patterns)) {
    result[key] = files.filter((file) => regex.test(file));
  }
  return result;
}


function formatSummary(buckets: Buckets): string {
  return [
    `CUT_GAMES: ${buckets.cut.length}`,
    `GOOD_WORD: ${buckets.good.length}`,
    `SHARED: ${buckets.shared.length}`,
    `ORIGINAL: ${buckets.original.length}`,
    `TOTAL: ${buckets.allFiles.length}`,
  ].join(" | ");
}

async function writeManifest(target: string, manifest: Manifest): Promise<void> {
  await writeFile(target, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
}

async function writeStatusDoc(output: string, buckets: Buckets, notes: string[]): Promise<void> {
  const lines: string[] = [];
  const generatedAt = new Date().toISOString();
  lines.push("# Game discovery status");
  lines.push("");
  lines.push(`Generated at ${generatedAt}.`);
  lines.push("");
  lines.push("## Counts");
  lines.push("- CUT_GAMES: " + buckets.cut.length);
  lines.push("- GOOD_WORD: " + buckets.good.length);
  lines.push("- SHARED: " + buckets.shared.length);
  lines.push("- ORIGINAL: " + buckets.original.length);
  lines.push("- Total scanned: " + buckets.allFiles.length);
  if (notes.length > 0) {
    lines.push("");
    lines.push("## Notes");
    for (const note of notes) {
      lines.push(`- ${note}`);
    }
  }
  lines.push("");
  await writeFile(output, lines.join("\n"), "utf8");
}

async function main(): Promise<void> {
  const buckets = await discoverGames();
  const manifestDir = path.join("games", "_manifests");
  await mkdir(manifestDir, { recursive: true });

  const generatedAt = new Date().toISOString();

  const cutManifest = {
    generatedAt,
    files: [...buckets.cut].sort(),
    hints: buildHints(buckets.cut, DEFAULT_HINT_PATTERNS),
  } satisfies Manifest;

  const goodManifest = {
    generatedAt,
    files: [...buckets.good].sort(),
    hints: buildHints(buckets.good, DEFAULT_HINT_PATTERNS),
  } satisfies Manifest;

  const originalHints = {
    ...DEFAULT_HINT_PATTERNS,
    ...ORIGINAL_EXTRA_HINTS,
  };
  const originalManifest = {
    generatedAt,
    files: [...buckets.original].sort(),
    hints: buildHints(buckets.original, originalHints),
  } satisfies Manifest;

  await writeManifest(path.join(manifestDir, "cut-games.manifest.json"), cutManifest);
  await writeManifest(path.join(manifestDir, "good-word.manifest.json"), goodManifest);
  await writeManifest(path.join(manifestDir, "original.manifest.json"), originalManifest);

  const summary = formatSummary(buckets);
  console.log("Game discovery summary:");
  console.log(summary);
  if (buckets.notes.length > 0) {
    for (const note of buckets.notes) {
      console.log(note);
    }
  }

  await mkdir("docs", { recursive: true });
  await writeStatusDoc(path.join("docs", "game-discovery.status.md"), buckets, buckets.notes);
}

main().catch((error) => {
  console.error("Failed to generate game manifests", error);
  process.exitCode = 1;
});
