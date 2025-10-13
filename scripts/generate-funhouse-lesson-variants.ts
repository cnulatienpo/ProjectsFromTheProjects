import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

interface LessonData {
  id?: string;
}

interface FunhouseVariantDefinition {
  name: string;
  description: string;
  mode: string;
  distortion: string;
}

interface CliOptions {
  lessonPath?: string;
  lessonId?: string;
  outputDir: string;
  variantPath?: string;
}

const DEFAULT_OUTPUT_DIR = path.join(
  "src",
  "games",
  "fun_house_writing",
  "generated",
);

const DEFAULT_VARIANTS: FunhouseVariantDefinition[] = [
  {
    name: "Write It Wrong",
    description: "Take the original device and butcher it. Make it fail on purpose.",
    mode: "text",
    distortion: "reverse purpose",
  },
  {
    name: "Dumb It Down",
    description: "Explain this concept like a himbo who thinks commas are a scam.",
    mode: "text",
    distortion: "tone:dumb",
  },
  {
    name: "Opposite Day",
    description:
      "Use the exact opposite technique. If it's fast, go slow. If it's subtle, go wild.",
    mode: "text",
    distortion: "negate",
  },
  {
    name: "Melt It",
    description: "Write as if the entire idea is melting into soup. Make it surreal.",
    mode: "freeform",
    distortion: "style:meltdown",
  },
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function escapeTemplateLiteral(raw: string): string {
  return raw.replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
}

function toKebabCase(value: string): string {
  return value
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

function toPascalCase(value: string): string {
  const tokens = value.match(/[a-zA-Z0-9]+/g);
  if (!tokens) {
    return "FunhouseVariant";
  }

  const camel = tokens
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join("");

  if (/^[0-9]/.test(camel)) {
    return `Variant${camel}`;
  }

  return camel;
}

async function loadLessonId(lessonPath: string): Promise<string | undefined> {
  const absolutePath = path.resolve(process.cwd(), lessonPath);
  const raw = await readFile(absolutePath, "utf8");
  const parsed = JSON.parse(raw) as LessonData;

  return typeof parsed.id === "string" && parsed.id.trim().length > 0
    ? parsed.id.trim()
    : undefined;
}

async function loadVariants(variantPath: string): Promise<FunhouseVariantDefinition[]> {
  const absolutePath = path.resolve(process.cwd(), variantPath);
  const raw = await readFile(absolutePath, "utf8");
  const parsed = JSON.parse(raw) as unknown;

  if (!Array.isArray(parsed)) {
    throw new Error(`Expected an array at ${absolutePath}`);
  }

  const variants: FunhouseVariantDefinition[] = [];

  for (const [index, item] of parsed.entries()) {
    if (!isRecord(item)) {
      throw new Error(`Variant at index ${index} is not an object in ${absolutePath}`);
    }

    const { name, description, mode, distortion } = item as Record<string, unknown>;

    if (typeof name !== "string" || name.trim().length === 0) {
      throw new Error(`Variant at index ${index} is missing a valid "name"`);
    }

    if (typeof description !== "string" || description.trim().length === 0) {
      throw new Error(`Variant "${name}" is missing a valid "description"`);
    }

    if (typeof mode !== "string" || mode.trim().length === 0) {
      throw new Error(`Variant "${name}" is missing a valid "mode"`);
    }

    if (typeof distortion !== "string" || distortion.trim().length === 0) {
      throw new Error(`Variant "${name}" is missing a valid "distortion"`);
    }

    variants.push({
      name: name.trim(),
      description: description.trim(),
      mode: mode.trim(),
      distortion: distortion.trim(),
    });
  }

  return variants;
}

function parseCliOptions(args: string[]): CliOptions {
  const options: CliOptions = {
    outputDir: DEFAULT_OUTPUT_DIR,
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    switch (arg) {
      case "--lesson": {
        options.lessonPath = args[index + 1];
        index += 1;
        break;
      }
      case "--lesson-id": {
        options.lessonId = args[index + 1];
        index += 1;
        break;
      }
      case "--output": {
        options.outputDir = args[index + 1];
        index += 1;
        break;
      }
      case "--variants": {
        options.variantPath = args[index + 1];
        index += 1;
        break;
      }
      default: {
        break;
      }
    }
  }

  return options;
}

function buildComponentSource(
  componentName: string,
  lessonId: string,
  variant: FunhouseVariantDefinition,
): string {
  const safeDescription = escapeTemplateLiteral(variant.description);

  return `// GENERATED FUNHOUSE GAME\nimport FunhouseGameShell from \"@/components/FunhouseGameShell\";\n\nexport default function ${componentName}() {\n  return (\n    <FunhouseGameShell\n      title=\"${variant.name}\"\n      lessonId=\"${lessonId}\"\n      mode=\"${variant.mode}\"\n      distortion=\"${variant.distortion}\"\n      description={\`${safeDescription}\`}\n    />\n  );\n}\n`;
}

async function writeVariantFile(
  outputDir: string,
  baseSlug: string,
  lessonId: string,
  variant: FunhouseVariantDefinition,
): Promise<void> {
  const componentName = toPascalCase(variant.name);
  const fileSlug = toKebabCase(variant.name);
  const fileName = `${baseSlug}--${fileSlug}.tsx`;
  const filePath = path.resolve(process.cwd(), outputDir, fileName);
  const source = buildComponentSource(componentName, lessonId, variant);

  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${source}`, "utf8");
}

async function resolveLessonId(options: CliOptions): Promise<string> {
  if (options.lessonId && options.lessonId.trim().length > 0) {
    return options.lessonId.trim();
  }

  if (options.lessonPath) {
    const lessonId = await loadLessonId(options.lessonPath);

    if (lessonId) {
      return lessonId;
    }
  }

  throw new Error(
    "Unable to resolve a lesson id. Provide --lesson-id or a JSON file via --lesson that contains an 'id' field.",
  );
}

async function resolveVariants(options: CliOptions): Promise<FunhouseVariantDefinition[]> {
  if (options.variantPath) {
    return loadVariants(options.variantPath);
  }

  return DEFAULT_VARIANTS;
}

async function main(): Promise<void> {
  const options = parseCliOptions(process.argv.slice(2));
  const lessonId = await resolveLessonId(options);
  const variants = await resolveVariants(options);

  const baseSlugCandidate = path.basename(lessonId);
  const baseSlug = toKebabCase(baseSlugCandidate || lessonId || "funhouse-lesson");
  const outputDir = path.resolve(process.cwd(), options.outputDir);

  await mkdir(outputDir, { recursive: true });

  await Promise.all(
    variants.map((variant) => writeVariantFile(outputDir, baseSlug, lessonId, variant)),
  );

  console.log(
    `✅ Generated ${variants.length} Funhouse variant component(s) for lesson "${lessonId}" in ${path.relative(process.cwd(), outputDir)}`,
  );
}

main().catch((error) => {
  console.error("❌ Failed to generate Funhouse variant components:", error);
  process.exitCode = 1;
});
