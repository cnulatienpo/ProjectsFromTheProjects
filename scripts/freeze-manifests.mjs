import { writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const outDir = join(root, "games/_cache");
await mkdir(outDir, { recursive: true });

async function loadDiscovery() {
  try {
    const mod = await import(join(root, "src/games/discovery.ts"));
    return mod;
  } catch {
    // If TS import fails in CI, fallback to existing manifests
    return null;
  }
}

(async () => {
  const disc = await loadDiscovery();
  if (!disc?.discoverGames) {
    console.log("[freeze-manifests] discovery not available; skipping.");
    process.exit(0);
  }
  const b = await disc.discoverGames();
  const now = new Date().toISOString();

  const mk = async (name, files, hintsExtra = []) => {
    const hints = {
      home: files.filter((x) => /(home|index|start|menu|hub)/i.test(x)).slice(0, 8),
      play: files.filter((x) => /(play|game|round|board|grid|letters|scene|order)/i.test(x)).slice(0, 8),
      rules: files.filter((x) => /(rules|help|how|about|tutorial)/i.test(x)).slice(0, 8),
    };
    // push extra hints on top
    hints.home = [...hintsExtra, ...hints.home];
    const payload = { generatedAt: now, files, hints };
    await writeFile(join(outDir, `${name}.cache.json`), JSON.stringify(payload, null, 2));
  };

  await mk("original", b.original, ["sigil", "syntax"]);
  await mk("good-word", b.good);
  await mk("cut-games", b.cut);

  console.log(
    "[freeze-manifests] wrote caches:",
    Object.fromEntries(
      ["original", "good-word", "cut-games"].map((n) => [n, `games/_cache/${n}.cache.json`]),
    ),
  );
})();
