// @ts-ignore
import cacheJson from "../../games/_cache/original.cache.json?raw";
// @ts-ignore
import manifestJson from "../../games/_manifests/original.manifest.json?raw";
import type { ComponentType } from "react";

type Manifest = {
  generatedAt?: string;
  files: string[];
  hints: Record<string, string[]>;
};

function readManifest(): Manifest {
  try {
    if (import.meta.env.PROD && cacheJson) {
      return JSON.parse(cacheJson) as Manifest;
    }
  } catch {}
  try {
    return JSON.parse(manifestJson) as Manifest;
  } catch {
    return { files: [], hints: { home: [], play: [], rules: [] } } as Manifest;
  }
}

const originalManifest = readManifest();

type HintKey = "home" | "play" | "rules";

export type Resolved = {
  home?: string;
  play?: string;
  rules?: string;
  fallbacks: string[];
  debug: { tried: string[] };
};

const COMPONENT_EXTENSIONS = [".tsx", ".jsx", ".js", ".ts"];

const manifestFiles = originalManifest.files ?? [];
const componentFiles = manifestFiles.filter((file) =>
  COMPONENT_EXTENSIONS.some((ext) => file.toLowerCase().endsWith(ext)),
);

function normalizePath(path: string): string {
  return path.replace(/^\.\//, "");
}

function pathExists(path: string): boolean {
  const normalized = normalizePath(path);
  return manifestFiles.includes(normalized);
}

function isComponentCandidate(path: string): boolean {
  const normalized = normalizePath(path).toLowerCase();
  return COMPONENT_EXTENSIONS.some((ext) => normalized.endsWith(ext));
}

function findByHints(manifest: Manifest, key: HintKey, debug: string[]): string | undefined {
  const hints = manifest.hints?.[key] ?? [];
  for (const hint of hints) {
    const normalized = normalizePath(hint);
    debug.push(`hint:${key}:${normalized}`);
    if (!isComponentCandidate(normalized)) {
      continue;
    }
    if (pathExists(normalized)) {
      return normalized;
    }
  }
  return undefined;
}

function findByPattern(pattern: RegExp, debugLabel: string, debug: string[]): string | undefined {
  debug.push(`pattern:${debugLabel}`);
  for (const file of componentFiles) {
    if (pattern.test(file)) {
      debug.push(`pattern:${debugLabel}:match:${file}`);
      return file;
    }
  }
  return undefined;
}

function toModuleSpecifier(modulePath: string): string | null {
  const normalized = normalizePath(modulePath);
  if (!normalized.startsWith("src/")) {
    return null;
  }

  const relative = normalized.slice("src/".length);
  const specifier = `../${relative}`;
  return specifier;
}

function isLikelyComponent(exportName: string, value: unknown): value is ComponentType<any> {
  if (typeof value !== "function") {
    return false;
  }
  if (value.displayName && typeof value.displayName === "string") {
    return true;
  }
  if (value.prototype && value.prototype.isReactComponent) {
    return true;
  }
  const resolvedName = value.name && value.name.length > 0 ? value.name : exportName;
  return /^[A-Z]/.test(resolvedName);
}

export function resolveOriginalScreens(): Resolved {
  const debug: string[] = [];
  const homePattern = /home|index|start|menu|hub|sigil|syntax/i;
  const playPattern = /play|game|round|board|grid|letters|scene|order/i;
  const rulesPattern = /rules|help|how|about|tutorial/i;

  const selected = new Map<HintKey, string | undefined>();

  selected.set("home", findByHints(originalManifest, "home", debug));
  selected.set("play", findByHints(originalManifest, "play", debug));
  selected.set("rules", findByHints(originalManifest, "rules", debug));

  if (!selected.get("home")) {
    selected.set("home", findByPattern(homePattern, "home", debug));
  }
  if (!selected.get("play")) {
    selected.set("play", findByPattern(playPattern, "play", debug));
  }
  if (!selected.get("rules")) {
    selected.set("rules", findByPattern(rulesPattern, "rules", debug));
  }
  if (!selected.get("rules")) {
    const aboutLike = manifestFiles.find((file) =>
      /(about|info|overview|readme|guide)/i.test(file),
    );
    if (aboutLike && isComponentCandidate(aboutLike)) {
      selected.set("rules", aboutLike);
    }
  }

  const used = new Set(
    Array.from(selected.values()).filter((value): value is string => Boolean(value)),
  );

  const remaining = componentFiles.filter((file) => !used.has(file));
  const fallbackTarget = remaining.length === 0
    ? 0
    : Math.min(remaining.length, Math.max(3, Math.min(5, remaining.length)));
  const fallbacks = remaining.slice(0, fallbackTarget);

  return {
    home: selected.get("home") ?? undefined,
    play: selected.get("play") ?? undefined,
    rules: selected.get("rules") ?? undefined,
    fallbacks,
    debug: { tried: debug },
  };
}

export async function loadComponent(modulePath: string): Promise<ComponentType<any>> {
  const specifier = toModuleSpecifier(modulePath);
  if (!specifier) {
    throw new Error(`Cannot resolve module specifier for ${modulePath}`);
  }

  const module = await import(/* @vite-ignore */ specifier);

  if (module?.default && isLikelyComponent("default", module.default)) {
    return module.default as ComponentType<any>;
  }

  for (const [exportName, value] of Object.entries(module)) {
    if (isLikelyComponent(exportName, value)) {
      return value as ComponentType<any>;
    }
  }

  throw new Error(`No component export found in module ${modulePath}`);
}

