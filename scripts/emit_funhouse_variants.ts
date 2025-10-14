import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

type LessonMetadata = {
  deprecated?: boolean;
};

type Lesson = {
  id: string;
  title?: string;
  summary?: string;
  core_prompt?: string;
  deprecated?: boolean;
  metadata?: LessonMetadata;
};

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

const DEFAULT_LESSONS_DIR = "foundation_lessons";
const DEFAULT_JSON_OUTPUT = "funhouse_variants.json";
const DEFAULT_TS_OUTPUT = path.join(
  "src",
  "games",
  "fun_house_writing",
  "generated_funhouse_variants.ts",
);

type CliOptions = {
  lessonsDir: string;
  tsOutputPath: string;
  jsonOutputPath: string | null;
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toBoolean(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

function toString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : undefined;
}

function normaliseLesson(json: unknown, source: string): Lesson | null {
  if (!isPlainObject(json)) {
    console.warn(`⚠️  Skipping lesson at ${source}: expected an object.`);
    return null;
  }

  const record = json as Record<string, unknown>;
  const idValue = toString(record.id);

  if (!idValue) {
    console.warn(`⚠️  Skipping lesson at ${source}: missing a valid "id" field.`);
    return null;
  }

  let metadata: LessonMetadata | undefined;
  if ("metadata" in record && isPlainObject(record.metadata)) {
    const deprecated = toBoolean((record.metadata as Record<string, unknown>).deprecated);
    metadata = deprecated === undefined ? undefined : { deprecated };
  }

  return {
    id: idValue,
    title: toString(record.title),
    summary: toString(record.summary),
    core_prompt: toString(record.core_prompt),
    deprecated: toBoolean(record.deprecated),
    metadata,
  };
}

async function loadLessons(lessonsDir: string): Promise<Lesson[]> {
  const directoryPath = path.resolve(process.cwd(), lessonsDir);
  let entries;

  try {
    entries = await readdir(directoryPath, { withFileTypes: true });
  } catch (error) {
    throw new Error(
      `Failed to read lessons directory at "${directoryPath}": ${(error as Error).message}`,
    );
  }

  const lessons: Lesson[] = [];
  const seenIds = new Set<string>();

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".json")) {
      continue;
    }

    const filePath = path.join(directoryPath, entry.name);

    try {
      const raw = await readFile(filePath, "utf8");
      const parsed = JSON.parse(raw) as unknown;
      const lesson = normaliseLesson(parsed, filePath);

      if (!lesson) {
        continue;
      }

      if (seenIds.has(lesson.id)) {
        console.warn(
          `⚠️  Skipping duplicate lesson id "${lesson.id}" found at ${filePath}.`,
        );
        continue;
      }

      seenIds.add(lesson.id);
      lessons.push(lesson);
    } catch (error) {
      console.warn(`⚠️  Failed to parse lesson at ${filePath}: ${(error as Error).message}`);
    }
  }

  lessons.sort((a, b) => a.id.localeCompare(b.id));

  return lessons;
}

function resolveCliOptions(args: string[]): CliOptions {
  let lessonsDir = process.env.FUNHOUSE_LESSONS_DIR ?? DEFAULT_LESSONS_DIR;
  let tsOutputPath = process.env.FUNHOUSE_TS_OUTPUT ?? DEFAULT_TS_OUTPUT;
  let jsonOutputPath: string | null;

  if (process.env.FUNHOUSE_JSON_OUTPUT === "false") {
    jsonOutputPath = null;
  } else if (typeof process.env.FUNHOUSE_JSON_OUTPUT === "string") {
    jsonOutputPath = process.env.FUNHOUSE_JSON_OUTPUT;
  } else {
    jsonOutputPath = DEFAULT_JSON_OUTPUT;
  }

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    switch (arg) {
      case "--lessons": {
        const next = args[index + 1];
        if (!next || next.startsWith("--")) {
          throw new Error("--lessons option requires a directory path");
        }

        lessonsDir = next;
        index += 1;
        break;
      }

      case "--ts": {
        const next = args[index + 1];
        if (!next || next.startsWith("--")) {
          throw new Error("--ts option requires a file path");
        }

        tsOutputPath = next;
        index += 1;
        break;
      }

      case "--json": {
        const next = args[index + 1];
        if (!next || next.startsWith("--")) {
          jsonOutputPath = DEFAULT_JSON_OUTPUT;
        } else {
          jsonOutputPath = next;
          index += 1;
        }
        break;
      }

      case "--no-json": {
        jsonOutputPath = null;
        break;
      }

      default:
        throw new Error(`Unknown CLI option "${arg}".`);
    }
  }

  const resolvedLessonsDir = path.resolve(process.cwd(), lessonsDir);
  const resolvedTsOutput = path.resolve(process.cwd(), tsOutputPath);
  const resolvedJsonOutput =
    jsonOutputPath === null ? null : path.resolve(process.cwd(), jsonOutputPath);

  return {
    lessonsDir: resolvedLessonsDir,
    tsOutputPath: resolvedTsOutput,
    jsonOutputPath: resolvedJsonOutput,
  };
}

function isDeprecated(lesson: Lesson): boolean {
  if (lesson.deprecated === true) {
    return true;
  }

  const metaDeprecated = Boolean(lesson.metadata?.deprecated);

  return metaDeprecated;
}

function hasValidTitle(lesson: Lesson): lesson is Lesson & {
  title: string;
} {
  return typeof lesson.title === "string" && lesson.title.trim().length > 0;
}

function getSummary(lesson: Lesson): string | null {
  if (typeof lesson.summary === "string" && lesson.summary.trim().length > 0) {
    return lesson.summary.trim();
  }

  return null;
}

function getCorePrompt(lesson: Lesson): string | null {
  if (typeof lesson.core_prompt === "string" && lesson.core_prompt.trim().length > 0) {
    return lesson.core_prompt.trim();
  }

  return null;
}

function createVariant(
  lesson: Lesson & { title: string },
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

function buildVariants(lessons: Lesson[]): FunhouseVariant[] {
  const variants: FunhouseVariant[] = [];

  for (const lesson of lessons) {
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

function formatTsFile(variants: FunhouseVariant[]): string {
  const header = "// AUTO-GENERATED FUNHOUSE PROMPTS — DO NOT EDIT BY HAND";
  const importLine = "import { FunhouseCatalog } from \"./types\";";
  const body = `export const generatedFunhouseVariants: FunhouseCatalog = ${JSON.stringify(
    variants,
    null,
    2,
  )};`;

  return `${header}\n\n${importLine}\n\n${body}\n`;
}

function formatJsonFile(variants: FunhouseVariant[]): string {
  return `${JSON.stringify(variants, null, 2)}\n`;
}

async function main(): Promise<void> {
  const options = resolveCliOptions(process.argv.slice(2));
  const lessons = await loadLessons(options.lessonsDir);
  const variants = buildVariants(lessons);
  const tsFileContents = formatTsFile(variants);

  await mkdir(path.dirname(options.tsOutputPath), { recursive: true });
  await writeFile(options.tsOutputPath, tsFileContents, "utf8");

  console.log(
    `✅ Wrote ${variants.length} Funhouse variants to ${path.relative(
      process.cwd(),
      options.tsOutputPath,
    )}`,
  );

  if (options.jsonOutputPath) {
    await mkdir(path.dirname(options.jsonOutputPath), { recursive: true });
    const jsonFileContents = formatJsonFile(variants);
    await writeFile(options.jsonOutputPath, jsonFileContents, "utf8");

    console.log(
      `✅ Wrote ${variants.length} Funhouse variants to ${path.relative(
        process.cwd(),
        options.jsonOutputPath,
      )}`,
    );
  }
}

main().catch((error) => {
  console.error("Failed to emit funhouse variants", error);
  process.exitCode = 1;
});
