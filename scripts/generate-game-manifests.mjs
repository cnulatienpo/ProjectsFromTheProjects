import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const require = createRequire(import.meta.url);

const DEFAULT_HINT_PATTERNS = {
  home: /(home|index|start|menu|hub)/i,
  play: /(play|game|round|board|grid|letters|word|scene)/i,
  rules: /(rules|help|how|about|tutorial)/i,
};

const ORIGINAL_EXTRA_HINTS = {
  sigil: /sigil/i,
  syntax: /syntax/i,
  scene: /scene/i,
  order: /order/i,
};

async function loadDiscoveryModule() {
  const discoveryUrl = new URL("../src/games/discovery.ts", import.meta.url);
  const source = await readFile(discoveryUrl, "utf8");
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
    fileName: fileURLToPath(discoveryUrl),
  });

  const moduleExports = {};
  const moduleObj = { exports: moduleExports };
  const context = vm.createContext({
    module: moduleObj,
    exports: moduleExports,
    require,
    __filename: fileURLToPath(discoveryUrl),
    __dirname: path.dirname(fileURLToPath(discoveryUrl)),
    process,
    console,
    Buffer,
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
  });

  const script = new vm.Script(transpiled.outputText, {
    filename: fileURLToPath(discoveryUrl),
  });
  script.runInContext(context);
  return moduleObj.exports;
}

function buildHints(files, patterns) {
  const result = {};
  for (const [key, regex] of Object.entries(patterns)) {
    result[key] = files.filter((file) => regex.test(file));
  }
  return result;
}

function formatSummary(buckets) {
  return [
    `CUT_GAMES: ${buckets.cut.length}`,
    `GOOD_WORD: ${buckets.good.length}`,
    `SHARED: ${buckets.shared.length}`,
    `ORIGINAL: ${buckets.original.length}`,
    `TOTAL: ${buckets.allFiles.length}`,
  ].join(" | ");
}

async function writeStatusDoc(output, buckets, notes) {
  const lines = [];
  const generatedAt = new Date().toISOString();
  lines.push("# Game discovery status");
  lines.push("");
  lines.push(`Generated at ${generatedAt}.`);
  lines.push("");
  lines.push("## Counts");
  lines.push(`- CUT_GAMES: ${buckets.cut.length}`);
  lines.push(`- GOOD_WORD: ${buckets.good.length}`);
  lines.push(`- SHARED: ${buckets.shared.length}`);
  lines.push(`- ORIGINAL: ${buckets.original.length}`);
  lines.push(`- Total scanned: ${buckets.allFiles.length}`);
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

async function main() {
  const discovery = await loadDiscoveryModule();
  const buckets = await discovery.discoverGames();

  const manifestDir = path.join("games", "_manifests");
  await mkdir(manifestDir, { recursive: true });
  const generatedAt = new Date().toISOString();

  const cutManifest = {
    generatedAt,
    files: [...buckets.cut].sort(),
    hints: buildHints(buckets.cut, DEFAULT_HINT_PATTERNS),
  };

  const goodManifest = {
    generatedAt,
    files: [...buckets.good].sort(),
    hints: buildHints(buckets.good, DEFAULT_HINT_PATTERNS),
  };

  const originalManifest = {
    generatedAt,
    files: [...buckets.original].sort(),
    hints: buildHints(buckets.original, {
      ...DEFAULT_HINT_PATTERNS,
      ...ORIGINAL_EXTRA_HINTS,
    }),
  };

  await writeFile(
    path.join(manifestDir, "cut-games.manifest.json"),
    `${JSON.stringify(cutManifest, null, 2)}\n`,
    "utf8"
  );
  await writeFile(
    path.join(manifestDir, "good-word.manifest.json"),
    `${JSON.stringify(goodManifest, null, 2)}\n`,
    "utf8"
  );
  await writeFile(
    path.join(manifestDir, "original.manifest.json"),
    `${JSON.stringify(originalManifest, null, 2)}\n`,
    "utf8"
  );

  console.log("Game discovery summary:");
  console.log(formatSummary(buckets));
  if (Array.isArray(buckets.notes)) {
    for (const note of buckets.notes) {
      console.log(note);
    }
  }

  await mkdir("docs", { recursive: true });
  await writeStatusDoc(path.join("docs", "game-discovery.status.md"), buckets, buckets.notes ?? []);
}

main().catch((error) => {
  console.error("Failed to generate game manifests", error);
  process.exitCode = 1;
});
