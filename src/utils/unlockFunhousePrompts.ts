import foundation from "@/data/foundation-skills.json";
import dictionary from "@/data/dictionary-skills.json";
import cut from "@/data/cut-skills.json";
import funhouse from "@/data/funhouse-prompts.json";

type SkillRecord = { id?: unknown } | string;

type FunhousePromptRecord = {
  id?: unknown;
  title?: unknown;
  description?: unknown;
  mode?: unknown;
  targets?: unknown;
  source?: unknown;
};

export type FunhousePrompt = {
  id: string;
  title: string;
  description: string;
  mode: string;
  targets: string[];
  source: string;
};

function normaliseSkillId(value: unknown): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  if (value && typeof value === "object" && "id" in value && typeof (value as { id?: unknown }).id === "string") {
    const trimmed = ((value as { id: string }).id ?? "").trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  return null;
}

function buildSkillSet(data: unknown): Set<string> {
  if (!Array.isArray(data)) {
    return new Set();
  }

  const ids = new Set<string>();
  for (const entry of data as SkillRecord[]) {
    const id = normaliseSkillId(entry);
    if (id) {
      ids.add(id);
    }
  }

  return ids;
}

function normaliseString(value: unknown, fallback: string): string {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.length > 0) {
      return trimmed;
    }
  }

  return fallback;
}

function normaliseTargets(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const targets: string[] = [];
  for (const entry of value) {
    if (typeof entry === "string") {
      const trimmed = entry.trim();
      if (trimmed.length > 0) {
        targets.push(trimmed);
      }
    }
  }

  return targets;
}

function normaliseFunhousePrompts(data: unknown): FunhousePrompt[] {
  if (!Array.isArray(data)) {
    return [];
  }

  const prompts: FunhousePrompt[] = [];

  for (const entry of data as FunhousePromptRecord[]) {
    const id = normaliseString(entry.id, "");
    const title = normaliseString(entry.title, "Untitled Funhouse Prompt");
    const description = normaliseString(entry.description, "");
    const mode = normaliseString(entry.mode, "free");
    const source = normaliseString(entry.source, "funhouse");
    const targets = normaliseTargets(entry.targets);

    if (!id) {
      continue;
    }

    prompts.push({
      id,
      title,
      description,
      mode,
      source,
      targets,
    });
  }

  return prompts;
}

const foundationSkills = buildSkillSet(foundation);
const dictionarySkills = buildSkillSet(dictionary);
const cutSkills = buildSkillSet(cut);
const knownSkills = new Set<string>([...foundationSkills, ...dictionarySkills, ...cutSkills]);
const funhousePrompts = normaliseFunhousePrompts(funhouse);

// Input: array of unlocked skill IDs like ["focus", "repetition"]
// Output: funhouse prompts that target those skills
export function getEligibleFunhousePrompts(unlockedSkills: string[]): FunhousePrompt[] {
  if (!Array.isArray(unlockedSkills) || unlockedSkills.length === 0) {
    return [];
  }

  const unlockedSet = new Set<string>();

  for (const skill of unlockedSkills) {
    if (typeof skill !== "string") {
      continue;
    }

    const trimmed = skill.trim();
    if (trimmed.length === 0 || !knownSkills.has(trimmed)) {
      continue;
    }

    unlockedSet.add(trimmed);
  }

  if (unlockedSet.size === 0) {
    return [];
  }

  return funhousePrompts.filter((prompt) => prompt.targets.some((skill) => unlockedSet.has(skill)));
}
