#!/usr/bin/env node
const path = require("path");
const fs = require("fs/promises");
const ts = require("typescript");
const vm = require("vm");
const { createRequire } = require("module");

const rootDir = path.resolve(__dirname, "..");
const discoverySourcePath = path.join(rootDir, "src/games/discovery.ts");
const manifestDir = path.join(rootDir, "games/_manifests");
const statusDocPath = path.join(rootDir, "docs/game-discovery.status.md");

async function loadDiscoveryModule() {
  const source = await fs.readFile(discoverySourcePath, "utf8");
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
    fileName: discoverySourcePath,
  });

  const module = { exports: {} };
  const context = {
    module,
    exports: module.exports,
    require: createRequire(discoverySourcePath),
    __dirname: path.dirname(discoverySourcePath),
    __filename: discoverySourcePath,
    process,
    console,
    Buffer,
    setTimeout,
    clearTimeout,
    setImmediate,
    clearImmediate,
  };

  vm.runInNewContext(transpiled.outputText, context, { filename: discoverySourcePath });
  return context.module.exports;
}

function buildHintMap(files, patterns) {
  const result = {};
  for (const [key, regex] of Object.entries(patterns)) {
    result[key] = files.filter((file) => regex.test(file));
  }
  return result;
}

function buildManifest(generatedAt, files, extras = undefined) {
  const basePatterns = {
    home: /(home|index|start|menu|hub)/i,
    play: /(play|game|round|board|grid|letters|word|scene)/i,
    rules: /(rules|help|how|about|tutorial)/i,
  };

  const hints = buildHintMap(files, basePatterns);

  if (extras) {
    const extraEntries = buildHintMap(files, extras);
    hints.extras = extraEntries;
  }

  return {
    generatedAt,
    files,
    hints,
  };
}

(async () => {
  const { discoverGames } = await loadDiscoveryModule();
  if (typeof discoverGames !== "function") {
    throw new Error("discoverGames export not found");
  }

  const buckets = await discoverGames();
  const generatedAt = new Date().toISOString();

  await fs.mkdir(manifestDir, { recursive: true });

  const cutManifest = buildManifest(generatedAt, buckets.cut);
  const goodManifest = buildManifest(generatedAt, buckets.good);
  const sharedManifest = buildManifest(generatedAt, buckets.shared);
  const originalExtras = {
    sigil: /sigil/i,
    syntax: /syntax/i,
    scene: /scene/i,
    order: /order/i,
  };
  const originalManifest = buildManifest(generatedAt, buckets.original, originalExtras);

  await fs.writeFile(
    path.join(manifestDir, "cut-games.manifest.json"),
    JSON.stringify(cutManifest, null, 2) + "\n",
    "utf8"
  );

  await fs.writeFile(
    path.join(manifestDir, "good-word.manifest.json"),
    JSON.stringify(goodManifest, null, 2) + "\n",
    "utf8"
  );

  await fs.writeFile(
    path.join(manifestDir, "shared.manifest.json"),
    JSON.stringify(sharedManifest, null, 2) + "\n",
    "utf8"
  );

  await fs.writeFile(
    path.join(manifestDir, "original.manifest.json"),
    JSON.stringify(originalManifest, null, 2) + "\n",
    "utf8"
  );

  const summaryLine = `CUT_GAMES=${buckets.cut.length} GOOD_WORD=${buckets.good.length} SHARED=${buckets.shared.length} ORIGINAL=${buckets.original.length} TOTAL=${buckets.allFiles.length}`;
  console.log(`[game-discovery] ${summaryLine}`);

  if (Array.isArray(buckets.notes) && buckets.notes.length > 0) {
    for (const note of buckets.notes) {
      console.log(`[game-discovery] note: ${note}`);
    }
  }

  const docLines = [
    "# Game Discovery Status",
    "",
    `Generated at ${generatedAt}`,
    "",
    `- CUT_GAMES: ${buckets.cut.length}`,
    `- GOOD_WORD: ${buckets.good.length}`,
    `- SHARED: ${buckets.shared.length}`,
    `- ORIGINAL: ${buckets.original.length}`,
    `- TOTAL: ${buckets.allFiles.length}`,
  ];

  if (Array.isArray(buckets.notes) && buckets.notes.length > 0) {
    docLines.push("", "## Notes");
    for (const note of buckets.notes) {
      docLines.push(`- ${note}`);
    }
  }

  await fs.writeFile(statusDocPath, docLines.join("\n") + "\n", "utf8");
})();
