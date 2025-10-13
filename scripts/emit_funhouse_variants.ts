import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { lessonCatalog } from "../src/lessons/lesson_catalog";

type LessonCatalogEntry = (typeof lessonCatalog)[number];

type FunhouseVariant = {
  id: string;
  title: string;
  description: string;
  mirrors_lesson_id: string;
  prompt_text: string;
  constraint_type: string;
  constraint_label: string;
  game_type: FunhouseGameType;
  ui_component: FunhouseComponentKey;
};

type FunhouseGameType =
  | "writing_prompt"
  | "beat_arcade"
  | "style_swap"
  | "experimental";

type FunhouseComponentKey =
  | "FreeWriteTextBox"
  | "BeatComboMachine"
  | "VoiceSwapGame"
  | "GenreMangleMachine"
  | "MirrorDrillUI"
  | "OneParagraphChallenge";

type Constraint = {
  type: string;
  label: string;
  ui: FunhouseComponentKey;
  gameType: FunhouseGameType;
};

const CONSTRAINTS: Constraint[] = [
  { type: "tone", label: "Make it melodramatic", ui: "FreeWriteTextBox", gameType: "writing_prompt" },
  { type: "tone", label: "Make it absurd comedy", ui: "FreeWriteTextBox", gameType: "writing_prompt" },
  { type: "POV", label: "Write in second person", ui: "VoiceSwapGame", gameType: "style_swap" },
  { type: "POV", label: "Unreliable narrator version", ui: "VoiceSwapGame", gameType: "style_swap" },
  { type: "genre", label: "Make it horror", ui: "GenreMangleMachine", gameType: "style_swap" },
  {
    type: "genre",
    label: "Make it noir detective fiction",
    ui: "GenreMangleMachine",
    gameType: "style_swap",
  },
  { type: "emotion", label: "Character denies the emotion", ui: "MirrorDrillUI", gameType: "experimental" },
  { type: "emotion", label: "Character explodes with the emotion", ui: "MirrorDrillUI", gameType: "experimental" },
  { type: "structure", label: "Write it backwards", ui: "BeatComboMachine", gameType: "beat_arcade" },
  {
    type: "structure",
    label: "List the story as 10 weird observations",
    ui: "OneParagraphChallenge",
    gameType: "experimental",
  },
];

const OUTPUT_PATH = path.join(
  "src",
  "games",
  "fun_house_writing",
  "generated_funhouse_variants.ts",
);

function isDeprecated(lesson: LessonCatalogEntry): boolean {
  const directDeprecated =
    typeof (lesson as { deprecated?: unknown }).deprecated === "boolean"
      ? Boolean((lesson as { deprecated?: boolean }).deprecated)
      : false;

  if (directDeprecated) {
    return true;
  }

  const metaDeprecated = Boolean(
    (lesson as { metadata?: { deprecated?: boolean } }).metadata?.deprecated,
  );

  return metaDeprecated;
}

function hasValidTitle(lesson: LessonCatalogEntry): lesson is LessonCatalogEntry & {
  title: string;
} {
  const title = (lesson as { title?: unknown }).title;
  return typeof title === "string" && title.trim().length > 0;
}

function getSummary(lesson: LessonCatalogEntry): string | null {
  const summary = (lesson as { summary?: unknown }).summary;
  if (typeof summary === "string" && summary.trim().length > 0) {
    return summary.trim();
  }

  return null;
}

function getCorePrompt(lesson: LessonCatalogEntry): string | null {
  const corePrompt = (lesson as { core_prompt?: unknown }).core_prompt;
  if (typeof corePrompt === "string" && corePrompt.trim().length > 0) {
    return corePrompt.trim();
  }

  return null;
}

function createVariant(
  lesson: LessonCatalogEntry & { title: string },
  constraint: Constraint,
  index: number,
): FunhouseVariant {
  const title = lesson.title.trim();
  const summary = getSummary(lesson);
  const corePrompt = getCorePrompt(lesson);
  const variantNumber = index + 1;

  const promptIntro = corePrompt
    ? `Original prompt: ${corePrompt}\n\n`
    : "";

  return {
    id: `${lesson.id}-funhouse-${variantNumber}`,
    title: `${title} – Funhouse Variant ${variantNumber}`,
    description: summary
      ? `${summary} Funhouse twist: ${constraint.label}.`
      : `Funhouse twist: ${constraint.label}.`,
    mirrors_lesson_id: lesson.id,
    prompt_text: `${promptIntro}Rewrite the lesson prompt but with this twist: ${constraint.label}.`,
    constraint_type: constraint.type,
    constraint_label: constraint.label,
    game_type: constraint.gameType,
    ui_component: constraint.ui,
  };
}

function buildVariants(): FunhouseVariant[] {
  const variants: FunhouseVariant[] = [];

  for (const lesson of lessonCatalog) {
    if (!hasValidTitle(lesson)) {
      continue;
    }

    if (isDeprecated(lesson)) {
      continue;
    }

    CONSTRAINTS.forEach((constraint, index) => {
      variants.push(createVariant(lesson, constraint, index));
    });
  }

  return variants;
}

function formatFile(variants: FunhouseVariant[]): string {
  const header = "// AUTO-GENERATED FUNHOUSE PROMPTS — DO NOT EDIT BY HAND";
  const importLine = "import { FunhouseCatalog } from \"./types\";";
  const body = `export const generatedFunhouseVariants: FunhouseCatalog = ${JSON.stringify(
    variants,
    null,
    2,
  )};`;

  return `${header}\n\n${importLine}\n\n${body}\n`;
}

async function main(): Promise<void> {
  const variants = buildVariants();
  const fileContents = formatFile(variants);

  await mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await writeFile(OUTPUT_PATH, fileContents, "utf8");
}

main().catch((error) => {
  console.error("Failed to emit funhouse variants", error);
  process.exitCode = 1;
});
