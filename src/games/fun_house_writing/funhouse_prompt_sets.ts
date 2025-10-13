import funhousePromptSetsJson from "./funhouse_prompt_sets.json";

export type FunhousePromptMode = "free" | "beat" | "timed";

export interface FunhousePromptSet {
  slug: string;
  title: string;
  description: string;
  text: string;
  mode: FunhousePromptMode;
  distortion: string;
  source: string;
}

function assertString(value: unknown, label: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Invalid ${label} in funhouse prompt set data`);
  }

  return value.trim();
}

function assertMode(value: unknown): FunhousePromptMode {
  const mode = assertString(value, "mode");

  if (mode !== "free" && mode !== "beat" && mode !== "timed") {
    throw new Error(`Unsupported funhouse prompt mode: ${mode}`);
  }

  return mode;
}

function normalisePromptSet(entry: Record<string, unknown>): FunhousePromptSet {
  return {
    slug: assertString(entry.slug, "slug"),
    title: assertString(entry.title, "title"),
    description: assertString(entry.description, "description"),
    text: assertString(entry.text, "text"),
    mode: assertMode(entry.mode),
    distortion: assertString(entry.distortion, "distortion"),
    source: assertString(entry.source, "source"),
  };
}

if (!Array.isArray(funhousePromptSetsJson)) {
  throw new Error("Funhouse prompt set data must be an array");
}

export const funhousePromptSets: ReadonlyArray<FunhousePromptSet> =
  (funhousePromptSetsJson as Record<string, unknown>[]) // JSON modules are typed as any
    .map((entry) => normalisePromptSet(entry));
