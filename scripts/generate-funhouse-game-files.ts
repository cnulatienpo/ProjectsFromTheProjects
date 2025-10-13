import { mkdir, readFile, readdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

interface FunhouseVariant {
  id: string;
  title: string;
  description: string;
  mirrors_lesson_id?: string;
  prompt_text: string;
  constraint_type?: string;
  constraint_label?: string;
  game_type: string;
  ui_component: string;
}

interface ComponentImportConfig {
  modulePath: string;
  isDefault?: boolean;
  importName?: string;
}

const DEFAULT_VARIANTS_PATH = "funhouse_variants.json";
const DEFAULT_OUTPUT_DIR = path.join(
  "src",
  "games",
  "fun_house_writing",
  "generated",
);

const COMPONENT_IMPORTS: Record<string, ComponentImportConfig> = {
  FreeWriteTextBox: {
    modulePath: "@/games/fun_house_writing/components/FreeWriteTextBox",
    isDefault: true,
  },
  VoiceSwapGame: {
    modulePath: "@/games/fun_house_writing/components/VoiceSwapGame",
    isDefault: true,
  },
  GenreMangleMachine: {
    modulePath: "@/games/fun_house_writing/components/GenreMangleMachine",
    isDefault: true,
  },
  MirrorDrillUI: {
    modulePath: "@/games/fun_house_writing/components/MirrorDrillUI",
    isDefault: true,
  },
  BeatComboMachine: {
    modulePath: "@/games/fun_house_writing/components/BeatComboMachine",
    isDefault: true,
  },
  OneParagraphChallenge: {
    modulePath: "@/games/fun_house_writing/components/OneParagraphChallenge",
    isDefault: true,
  },
  VoiceImpersonatorChallenge: {
    modulePath: "@/games/fun_house_writing/components/VoiceImpersonatorChallenge",
    isDefault: true,
  },
  TellEverythingShowNothing: {
    modulePath: "@/games/fun_house_writing/components/TellEverythingShowNothing",
    isDefault: true,
  },
};

function toComponentName(id: string): string {
  const tokens = id.split(/[^a-zA-Z0-9]+/g).filter(Boolean);
  if (tokens.length === 0) {
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

function buildComponentImport(uiComponent: string): { statement: string; identifier: string } {
  const config = COMPONENT_IMPORTS[uiComponent];

  if (!config) {
    const identifier = "UnknownComponent";
    return {
      statement: `const ${identifier} = () => <div>Unknown UI Component: ${uiComponent}</div>;`,
      identifier,
    };
  }

  const identifier = config.importName ?? uiComponent;
  if (config.isDefault) {
    return {
      statement: `import ${identifier} from "${config.modulePath}";`,
      identifier,
    };
  }

  const importName = config.importName ?? identifier;
  return {
    statement: `import { ${importName} as ${identifier} } from "${config.modulePath}";`,
    identifier,
  };
}

function buildPromptLiteral(variant: FunhouseVariant): string {
  const promptObject: Record<string, unknown> = {
    id: variant.id,
    title: variant.title,
    description: variant.description,
    mirrors_lesson_id: variant.mirrors_lesson_id,
    prompt_text: variant.prompt_text,
    constraint_type: variant.constraint_type,
    constraint_label: variant.constraint_label,
    game_type: variant.game_type,
    ui_component: variant.ui_component,
  };

  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(promptObject)) {
    if (value !== undefined && value !== null) {
      cleaned[key] = value;
    }
  }

  const json = JSON.stringify(cleaned, null, 2);
  const indented = json
    .split("\n")
    .map((line) => `  ${line}`)
    .join("\n");
  return `const prompt: FunhousePrompt =\n${indented};`;
}

function buildFileContents(variant: FunhouseVariant): string {
  const componentImport = buildComponentImport(variant.ui_component);
  const componentName = toComponentName(variant.id);
  const promptLiteral = buildPromptLiteral(variant);

  return `// AUTO-GENERATED FUNHOUSE GAME FILE — DO NOT EDIT BY HAND\n\nimport type { JSX } from "react";\nimport type { FunhousePrompt } from "@/games/fun_house_writing/types";\n${componentImport.statement}\n\n${promptLiteral}\n\nexport default function ${componentName}(): JSX.Element {\n  return <${componentImport.identifier} prompt={prompt} />;\n}\n`;
}

async function ensureCleanDirectory(directory: string): Promise<void> {
  await mkdir(directory, { recursive: true });
  const entries = await readdir(directory, { withFileTypes: true }).catch(() => []);

  await Promise.all(
    entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".tsx"))
      .map((entry) => unlink(path.join(directory, entry.name)).catch((error) => {
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
          throw error;
        }
      })),
  );
}

async function loadVariants(variantPath: string): Promise<FunhouseVariant[]> {
  const absolutePath = path.resolve(process.cwd(), variantPath);
  const raw = await readFile(absolutePath, "utf8");
  const parsed = JSON.parse(raw) as FunhouseVariant[];

  if (!Array.isArray(parsed)) {
    throw new Error(`Expected an array of variants at ${absolutePath}`);
  }

  return parsed;
}

async function writeVariantFile(directory: string, variant: FunhouseVariant): Promise<void> {
  const fileName = `${variant.id}.tsx`;
  const filePath = path.join(directory, fileName);
  const contents = buildFileContents(variant);
  await writeFile(filePath, contents, "utf8");
}

async function main(): Promise<void> {
  const variantPath = process.env.FUNHOUSE_VARIANTS_PATH ?? DEFAULT_VARIANTS_PATH;
  const outputDir = process.env.FUNHOUSE_COMPONENT_OUTPUT ?? DEFAULT_OUTPUT_DIR;

  const variants = await loadVariants(variantPath);
  await ensureCleanDirectory(outputDir);

  await Promise.all(variants.map((variant) => writeVariantFile(outputDir, variant)));

  console.log(`✅ Generated ${variants.length} Funhouse game file(s) in ${outputDir}`);
}

main().catch((error) => {
  console.error("❌ Failed to generate Funhouse game files:", error);
  process.exitCode = 1;
});
