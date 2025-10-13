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
  game_type: "writing_prompt";
  ui_component: "FreeWriteTextBox";
};

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

function createVariant(lesson: LessonCatalogEntry & { title: string }): FunhouseVariant {
  const title = lesson.title.trim();

  return {
    id: `funhouse-${lesson.id}`,
    title: `BREAK: ${title}`,
    description: "Do the opposite of what this lesson teaches. Write it wrong, make it weird.",
    mirrors_lesson_id: lesson.id,
    prompt_text: `Write a scene that breaks the rule of '${title}'. Do the exact opposite and try to make it fun.`,
    game_type: "writing_prompt",
    ui_component: "FreeWriteTextBox",
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

    variants.push(createVariant(lesson));
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
