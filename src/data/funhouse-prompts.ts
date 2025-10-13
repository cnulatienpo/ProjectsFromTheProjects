import foundationPromptsJson from "@/data/foundation-prompts.json";
import cutPromptsJson from "@/data/cut-prompts.json";
import dictionaryPromptsJson from "@/data/dictionary-prompts.json";

export type PromptSource = "foundation" | "cut" | "dictionary";

export interface BasePrompt {
  id: string;
  title: string;
  instructions: string;
  tags: string[];
  source: PromptSource;
}

export interface FunhouseVariant {
  id: string;
  mode: string;
  instructions: string;
}

export interface FunhousePrompt extends BasePrompt {
  variants: FunhouseVariant[];
}

type PromptRecord = {
  id?: unknown;
  title?: unknown;
  instructions?: unknown;
  tags?: unknown;
};

type RemixBlueprint = {
  key: string;
  mode: string;
  tone: string;
  genre: string;
  badWriting: string;
  randomConstraint: string;
};

function normaliseString(value: unknown, fallback: string): string {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.length > 0) {
      return trimmed;
    }
  }

  return fallback;
}

function normaliseTags(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const tags: string[] = [];
  for (const entry of value) {
    if (typeof entry === "string") {
      const trimmed = entry.trim();
      if (trimmed.length > 0) {
        tags.push(trimmed.toLowerCase());
      }
    }
  }

  return tags;
}

function normalisePrompt(record: PromptRecord, source: PromptSource, fallbackIndex: number): BasePrompt {
  const id = normaliseString(record.id, `${source}-${String(fallbackIndex).padStart(3, "0")}`);
  const title = normaliseString(record.title, "Untitled Prompt");
  const instructions = normaliseString(
    record.instructions,
    "Write something gloriously chaotic."
  );
  const tags = normaliseTags(record.tags);

  return {
    id,
    title,
    instructions,
    tags,
    source,
  };
}

export function loadBasePrompts(): BasePrompt[] {
  const sources: Array<{ source: PromptSource; data: unknown }> = [
    { source: "foundation", data: foundationPromptsJson },
    { source: "cut", data: cutPromptsJson },
    { source: "dictionary", data: dictionaryPromptsJson },
  ];

  const prompts: BasePrompt[] = [];

  for (const { source, data } of sources) {
    if (!Array.isArray(data)) {
      continue;
    }

    data.forEach((entry, index) => {
      prompts.push(
        normalisePrompt(
          (entry ?? {}) as PromptRecord,
          source,
          index + 1,
        ),
      );
    });
  }

  return prompts;
}

const remixBlueprints: RemixBlueprint[] = [
  {
    key: "noir-sarcasm",
    mode: "Noir Sarcasm Spiral",
    tone: "Narrate like a detective who has seen too much sincerity and is allergic to it.",
    genre: "Drench the world in rain-slick noir alleys and flickering neon.",
    badWriting: "Use every cigarette cliché you can invent and never stop with the similes.",
    randomConstraint: "End every sentence with an accusatory 'see?' even when it hurts.",
  },
  {
    key: "romantic-horror",
    mode: "Romantic Horror Waltz",
    tone: "Sound like a love letter written inside a haunted house with the lights off.",
    genre: "Blend swoony gothic romance with creeping horror imagery.",
    badWriting: "Lean into overripe metaphors that drip like doomed chandeliers.",
    randomConstraint: "Every paragraph must include a heartbeat that may or may not be the house.",
  },
  {
    key: "monotone-epic",
    mode: "Monotone Epic Chronicle",
    tone: "Tell the tale like a bored immortal narrating yet another prophecy.",
    genre: "Frame the story as an epic fantasy prophecy gone stale.",
    badWriting: "Overuse passive voice until the verbs forget what action is.",
    randomConstraint: "Only five-word sentences are allowed; cheat with em dashes if you must.",
  },
  {
    key: "sci-fi-chaos",
    mode: "Glitchy Sci-Fi Manifesto",
    tone: "Adopt the voice of a malfunctioning AI motivational speaker.",
    genre: "Blast the scene into neon-drenched science fiction with broken user manuals.",
    badWriting: "Sprinkle in technobabble buzzwords that contradict each other.",
    randomConstraint: "Every third sentence must rhyme with 'zap'.",
  },
  {
    key: "mythic-snark",
    mode: "Mythic Snark Oracle",
    tone: "Prophesy with smug omniscience and zero patience for mortals.",
    genre: "Wrap the prompt in mythic high-fantasy stakes and divine bureaucracy.",
    badWriting: "List far too many proper nouns that sound suspiciously similar.",
    randomConstraint: "Work in at least three unhelpful footnote-style asides in parentheses.",
  },
  {
    key: "camp-chaos",
    mode: "Purple Prose Disaster",
    tone: "Write like a soap opera villain pretending to be a poet.",
    genre: "Slide between melodramatic ballroom drama and accidental camp.",
    badWriting: "Every noun deserves three adjectives and a sigh.",
    randomConstraint: "Force a full-sentence alliteration every other line.",
  },
  {
    key: "deadpan-western",
    mode: "Deadpan Cosmic Western",
    tone: "Speak in a flat drawl that refuses to acknowledge the chaos.",
    genre: "Set everything on a dusty planet with two moons and zero patience.",
    badWriting: "Repeat yourself like the tumbleweeds demanded it.",
    randomConstraint: "Mention the taste of starlight in every stanza.",
  },
  {
    key: "operatic-heist",
    mode: "Operatic Heist Catastrophe",
    tone: "Sing every instruction as if the plan is failing spectacularly mid-aria.",
    genre: "Treat the scene like a glittering heist musical gone wrong.",
    badWriting: "Break into parenthetical stage directions that contradict themselves.",
    randomConstraint: "Every line must end with an exclamation point you half-regret!",
  },
];

function hashString(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash;
}

function rotateBlueprints(offset: number): RemixBlueprint[] {
  const normalizedOffset = offset % remixBlueprints.length;
  if (normalizedOffset === 0) {
    return remixBlueprints.slice();
  }

  return [
    ...remixBlueprints.slice(normalizedOffset),
    ...remixBlueprints.slice(0, normalizedOffset),
  ];
}

function buildVariantInstructions(base: BasePrompt, blueprint: RemixBlueprint): string {
  const tagLine = base.tags.length
    ? `Keep nodding to these craft gremlins: ${base.tags.join(", ")}.`
    : "Invent new craft gremlins on the fly.";

  return [
    `Original directive: ${base.instructions}`,
    `Mode switch: ${blueprint.mode}.`,
    `Tone swap: ${blueprint.tone}`,
    `Genre costume: ${blueprint.genre}`,
    `Bad-writing demand: ${blueprint.badWriting}`,
    `Random chaos rule: ${blueprint.randomConstraint}`,
    tagLine,
    "Make it proudly messy, celebrate failure, and write the version that would horrify your neat-freak future self.",
  ].join("\n\n");
}

export function remixPromptToVariants(base: BasePrompt, desiredCount = 5): FunhouseVariant[] {
  const minimumCount = Math.max(desiredCount, 5);
  const offset = hashString(base.id + base.source);
  const rotated = rotateBlueprints(offset);

  return rotated.slice(0, minimumCount).map((blueprint, index) => ({
    id: `${base.id}-funhouse-${index + 1}`,
    mode: blueprint.mode,
    instructions: buildVariantInstructions(base, blueprint),
  }));
}

export const funhousePrompts: FunhousePrompt[] = loadBasePrompts().map((prompt) => ({
  ...prompt,
  variants: remixPromptToVariants(prompt),
}));

const variantIndex = (() => {
  const index = new Map<string, { prompt: FunhousePrompt; variant: FunhouseVariant }>();

  for (const prompt of funhousePrompts) {
    for (const variant of prompt.variants) {
      if (!index.has(variant.id)) {
        index.set(variant.id, { prompt, variant });
      }
    }
  }

  return index;
})();

export function findFunhouseVariantById(id: string): { prompt: FunhousePrompt; variant: FunhouseVariant } | null {
  return variantIndex.get(id) ?? null;
}

export function listAllFunhouseVariants(): FunhouseVariant[] {
  return Array.from(variantIndex.values()).map((entry) => entry.variant);
}
