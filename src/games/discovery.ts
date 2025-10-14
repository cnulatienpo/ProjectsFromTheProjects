import { promises as fs } from "fs";
import type { Dirent } from "fs";
import path from "path";

export type Buckets = {
  cut: string[];
  good: string[];
  shared: string[];
  original: string[];
  allFiles: string[];
  notes: string[];
};

const CODE_EXTENSIONS = new Set([".tsx", ".ts", ".jsx", ".js"]);
const IGNORE_SEGMENTS = new Set(["node_modules", ".git", ".next", "dist"]);

const KEYWORDS = {
  cut: ["cut", "cutgame", "cut-games", "cutgames", "splice", "scissor", "trimmer", "editor-cut"],
  good: ["good-word", "the-good-word", "goodword", "good word"],
  shared: ["shared", "common", "core", "utils", "hooks", "store", "adapter", "rag", "llama", "prompts", "snippets", "types", "lib"],
};

const SCAN_ROOTS = ["pages", "src", "components", "public"];

const PRIORITY: Array<keyof Buckets> = ["cut", "good", "shared", "original"];

type Classified = {
  bucket: keyof Buckets;
  keywords: string[];
};

function toPosix(relPath: string): string {
  return relPath.split(path.sep).join("/");
}

function shouldIgnore(relPath: string): boolean {
  const segments = relPath.split(/[/\\]/);
  return segments.some((segment) => IGNORE_SEGMENTS.has(segment));
}

async function readIfCode(filePath: string): Promise<string> {
  const ext = path.extname(filePath);
  if (!CODE_EXTENSIONS.has(ext)) {
    return "";
  }
  try {
    return await fs.readFile(filePath, "utf8");
  } catch (error) {
    return "";
  }
}

function detectBuckets(relPath: string, lowercaseBlob: string): Classified {
  const matched: Array<{ bucket: keyof Buckets; keyword: string }> = [];

  for (const keyword of KEYWORDS.cut) {
    if (lowercaseBlob.includes(keyword)) {
      matched.push({ bucket: "cut", keyword });
    }
  }

  for (const keyword of KEYWORDS.good) {
    if (lowercaseBlob.includes(keyword)) {
      matched.push({ bucket: "good", keyword });
    }
  }

  for (const keyword of KEYWORDS.shared) {
    if (lowercaseBlob.includes(keyword)) {
      matched.push({ bucket: "shared", keyword });
    }
  }

  if (matched.length === 0) {
    return { bucket: "original", keywords: [] };
  }

  matched.sort((a, b) => PRIORITY.indexOf(a.bucket) - PRIORITY.indexOf(b.bucket));
  const winningBucket = matched[0].bucket;
  const winningKeywords = matched
    .filter((item) => item.bucket === winningBucket)
    .map((item) => item.keyword);

  return { bucket: winningBucket, keywords: winningKeywords };
}

export async function discoverGames(): Promise<Buckets> {
  const rootDir = process.cwd();
  const bucketMap: Buckets = {
    cut: [],
    good: [],
    shared: [],
    original: [],
    allFiles: [],
    notes: [],
  };

  const allFilesSet = new Set<string>();
  const ambiguousNotes: string[] = [];

  async function walk(relativeDir: string): Promise<void> {
    const absoluteDir = path.join(rootDir, relativeDir);
    let entries: Dirent[];
    try {
      entries = await fs.readdir(absoluteDir, { withFileTypes: true });
    } catch (error: any) {
      if (error && error.code === "ENOENT") {
        return;
      }
      throw error;
    }

    for (const entry of entries) {
      const rel = toPosix(path.join(relativeDir, entry.name));
      if (shouldIgnore(rel)) {
        continue;
      }

      const absolutePath = path.join(rootDir, rel);

      if (entry.isDirectory()) {
        await walk(rel);
        continue;
      }

      if (allFilesSet.has(rel)) {
        continue;
      }

      allFilesSet.add(rel);
      bucketMap.allFiles.push(rel);

      const lowerPath = rel.toLowerCase();
      const content = await readIfCode(absolutePath);
      const blob = `${lowerPath}\n${content.toLowerCase()}`;

      const cutMatch = KEYWORDS.cut.filter((keyword) => blob.includes(keyword));
      const goodMatch = KEYWORDS.good.filter((keyword) => blob.includes(keyword));
      const sharedMatch = KEYWORDS.shared.filter((keyword) => blob.includes(keyword));

      const matches = [
        ...(cutMatch.length > 0 ? ["cut"] : []),
        ...(goodMatch.length > 0 ? ["good"] : []),
        ...(sharedMatch.length > 0 ? ["shared"] : []),
      ];

      if (matches.length > 1) {
        ambiguousNotes.push(`ambiguous: ${rel} -> ${matches.join(", ")}`);
      }

      const { bucket } = detectBuckets(rel, blob);
      bucketMap[bucket].push(rel);
    }
  }

  for (const root of SCAN_ROOTS) {
    await walk(root);
  }

  bucketMap.cut.sort();
  bucketMap.good.sort();
  bucketMap.shared.sort();
  bucketMap.original.sort();
  bucketMap.allFiles.sort();

  const summary = `counts => cut: ${bucketMap.cut.length}, good: ${bucketMap.good.length}, shared: ${bucketMap.shared.length}, original: ${bucketMap.original.length}, total: ${bucketMap.allFiles.length}`;
  bucketMap.notes.push(summary);
  bucketMap.notes.push(...ambiguousNotes);

  return bucketMap;
}
