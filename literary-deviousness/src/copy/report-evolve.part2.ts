import type { RagResult } from "@/lib/rag-types";
import {
  STYLE_REPORT_SCHEMA_VERSION,
  type LevelSpec,
  type WriterType,
} from "./report-evolve.part1";

let P: any = {},
  S: any = {};
try {
  P = require("@/copy/prompts");
} catch {}
try {
  S = require("@/copy/snippets");
} catch {}

export const LEVEL_SPECS_PART2: LevelSpec[] = [
  {
    level: 4,
    tone: "collegial",
    dimensions: [
      {
        name: "Symbol Coherence",
        key: "symbol",
        weight: 0.2,
        guidance: "1–2 symbols repeat with purpose tied to pressure?",
      },
      {
        name: "Motif Echo",
        key: "motif",
        weight: 0.15,
        guidance: "Deliberate echo binds time/space (2–3x)?",
      },
      {
        name: "Device Fit",
        key: "devices",
        weight: 0.15,
        guidance: "Devices serve stakes, not decorate?",
      },
      {
        name: "Voice",
        key: "voice",
        weight: 0.25,
        guidance: "Consistent diction/rhythm/POV distance.",
      },
      {
        name: "Clarity",
        key: "clarity",
        weight: 0.25,
        guidance: "Orient who/where/what; remove accidental ambiguity.",
      },
    ],
    flags: ["symbol soup", "ornamental device", "muddy POV"],
    memoSections: [
      "Voice",
      "Devices",
      "Symbol & Motif",
      "Clarity",
      "Next-Draft Focus",
    ],
  },
  {
    level: 5,
    tone: "collegial",
    dimensions: [
      {
        name: "Pacing & Turns",
        key: "pacing",
        weight: 0.3,
        guidance: "Pressure build + clear turn; beat spacing.",
      },
      {
        name: "Structure Integrity",
        key: "structure",
        weight: 0.25,
        guidance: "Entry/exit logic; cause→effect; goal/obstacle clarity.",
      },
      {
        name: "Voice",
        key: "voice",
        weight: 0.2,
        guidance: "Note any sudden style shifts.",
      },
      {
        name: "Clarity",
        key: "clarity",
        weight: 0.25,
        guidance: "Swift orientation; clean pronouns; time/place anchors.",
      },
    ],
    flags: ["flat middle", "no turn", "goal drift"],
    memoSections: [
      "Structure & Pacing",
      "Voice",
      "Clarity",
      "Next-Draft Focus",
    ],
  },
  {
    level: 6,
    tone: "professorial",
    dimensions: [
      {
        name: "Revision Moves",
        key: "revision",
        weight: 0.35,
        guidance: "Trims/merges/expansions that raise impact most.",
      },
      {
        name: "Beat Integrity",
        key: "beats",
        weight: 0.25,
        guidance: "Internal vs external beats balanced; beats distinct.",
      },
      {
        name: "Continuity",
        key: "continuity",
        weight: 0.2,
        guidance: "Character logic, objects, timeline sanity.",
      },
      {
        name: "Clarity",
        key: "clarity",
        weight: 0.2,
        guidance: "Line-level flow; sentence surgery opportunities.",
      },
    ],
    flags: ["continuity slip", "revision avoidance"],
    memoSections: [
      "Revision Plan",
      "Beat Integrity",
      "Continuity",
      "Clarity",
      "Next-Draft Focus",
    ],
  },
  {
    level: 7,
    tone: "professorial",
    dimensions: [
      {
        name: "Internal Logic",
        key: "logic",
        weight: 0.35,
        guidance: "Causal chains; no magic fixes; costs are paid.",
      },
      {
        name: "Stakes & Consequence",
        key: "stakes",
        weight: 0.25,
        guidance: "Choices produce costs; outcomes matter.",
      },
      {
        name: "Voice",
        key: "voice",
        weight: 0.2,
        guidance: "Voice persists under pressure; reduce filler.",
      },
      {
        name: "Clarity",
        key: "clarity",
        weight: 0.2,
        guidance: "Purposeful ambiguity only; remove accidental fog.",
      },
    ],
    flags: ["free lunch outcome", "convenient coincidence"],
    memoSections: [
      "Logic & Stakes",
      "Voice",
      "Clarity",
      "Next-Draft Focus",
    ],
  },
  {
    level: 8,
    tone: "editorial",
    dimensions: [
      {
        name: "Signature Style",
        key: "signature",
        weight: 0.3,
        guidance: "Name stylistic fingerprints; show where they appear.",
      },
      {
        name: "Device Weave",
        key: "weave",
        weight: 0.25,
        guidance: "Multiple devices working together without overstatement.",
      },
      {
        name: "Structure",
        key: "structure",
        weight: 0.2,
        guidance: "Scene economy; every beat earns its keep.",
      },
      {
        name: "Clarity",
        key: "clarity",
        weight: 0.25,
        guidance: "Line-edit readiness; minimal noise.",
      },
    ],
    flags: ["style wobble", "overdecorated"],
    memoSections: [
      "Signature Style",
      "Device Weave",
      "Structure",
      "Clarity",
      "Next-Draft Focus",
    ],
  },
  {
    level: 9,
    tone: "editorial",
    dimensions: [
      {
        name: "Collaboration Readiness",
        key: "collab",
        weight: 0.25,
        guidance: "Ready for beta readers? What should they answer?",
      },
      {
        name: "Editability",
        key: "editability",
        weight: 0.25,
        guidance: "Clean enough for pro pass?",
      },
      {
        name: "Structure",
        key: "structure",
        weight: 0.25,
        guidance: "Scene role in manuscript arc; handoff.",
      },
      {
        name: "Voice",
        key: "voice",
        weight: 0.25,
        guidance: "Distinct voice preserved under edits.",
      },
    ],
    flags: ["unclear reader ask", "dirty copy"],
    memoSections: [
      "Collab Readiness",
      "Structure",
      "Voice",
      "Next-Draft Focus",
    ],
  },
  {
    level: 10,
    tone: "editorial",
    dimensions: [
      {
        name: "Publication Fit",
        key: "pubfit",
        weight: 0.35,
        guidance: "Positioning; comps; trim/expand suggestions.",
      },
      {
        name: "Line Edit Readiness",
        key: "line",
        weight: 0.25,
        guidance: "Rhythm, clarity, syntax; Chicago-style nits.",
      },
      {
        name: "Structure",
        key: "structure",
        weight: 0.2,
        guidance: "Macro cohesion; scene sequencing in arc.",
      },
      {
        name: "Voice",
        key: "voice",
        weight: 0.2,
        guidance: "Maintained and refined.",
      },
    ],
    flags: ["market mismatch", "copyedit debt"],
    memoSections: [
      "Publication Fit",
      "Line Readiness",
      "Structure",
      "Voice",
      "Next Steps",
    ],
  },
];

export const WRITER_MODS: Record<
  WriterType,
  { weightBoost?: Partial<Record<string, number>>; memoHints?: string[] }
> = {
  blueprint: {
    weightBoost: { structure: +0.05, clarity: +0.05 },
    memoHints: ["Lean on scaffold; allow one genuine surprise."],
  },
  thief: {
    weightBoost: { signature: +0.05, voice: +0.05 },
    memoHints: ["Remix boldly; transform diction so it’s yours."],
  },
  actor: {
    weightBoost: { beats: +0.05, voice: +0.05 },
    memoHints: ["Read aloud; shape sentences to breath and gesture."],
  },
  patterner: {
    weightBoost: { weave: +0.05, motif: +0.05 },
    memoHints: ["Let pattern serve pressure, not the other way around."],
  },
  sprinter: { memoHints: ["Slow the middle to earn the turn."] },
  gardener: { memoHints: ["Prune redundancies; keep living branches."] },
  worldbuilder: {
    memoHints: [
      "Seed setting details that carry emotional weight, not encyclopedia.",
    ],
  },
  minimalist: {
    memoHints: ["Selective expansion: add one concrete image per paragraph."],
  },
  maximalist: { memoHints: ["Compression pass: delete repeated claims."] },
  experimental: {
    memoHints: ["Make the rule visible, then break it on purpose."],
  },
};

export function applyWriterMods(
  spec: LevelSpec,
  writer?: WriterType
): LevelSpec {
  if (!writer) return spec;
  const mod = WRITER_MODS[writer];
  if (!mod?.weightBoost) return spec;
  const dimensions = spec.dimensions.map((d) => ({
    ...d,
    weight: Math.max(
      0,
      Math.min(1, d.weight + (mod.weightBoost?.[d.key] ?? 0))
    ),
  }));
  return { ...spec, dimensions };
}

function baseSys() {
  return P.systemEvaluator ?? "You are a concise literary evaluator.";
}
function jsonRule() {
  return (
    P.jsonConstraintV2 ??
    "Return JSON: overall, dimensions[], flags[], tips[], citations[], evidence[]."
  );
}

export function buildEvalPrompt(args: {
  level: number;
  writerType?: WriterType | null;
  text: string;
}): string {
  const spec =
    LEVEL_SPECS_PART2.find((s) => s.level === args.level) ?? LEVEL_SPECS_PART2[0];
  const dims = spec.dimensions
    .map(
      (d) => `- ${d.name} [${d.key}] w=${d.weight.toFixed(2)}: ${d.guidance}`
    )
    .join("\n");
  const examples = Array.isArray(S.examplesV2) ? S.examplesV2.join("\n\n") : "";
  return [
    baseSys(),
    jsonRule(),
    `LEVEL ${spec.level} — tone:${spec.tone}`,
    `DIMENSIONS:\n${dims}`,
    `TEXT:\n${args.text}`,
    examples ? `EXAMPLES:\n${examples}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function buildMemoPrompt(
  result: RagResult,
  args: { level: number; writerType?: WriterType | null }
): string {
  const spec =
    LEVEL_SPECS_PART2.find((s) => s.level === args.level) ?? LEVEL_SPECS_PART2[0];
  const order = spec.memoSections.join(" | ");
  const sys = P.systemMemo?.(spec.tone) ?? `Write like a ${spec.tone} mentor.`;
  return [
    sys,
    `Schema:${STYLE_REPORT_SCHEMA_VERSION}`,
    `Sections in order: ${order}`,
    `Numbers & Evidence (JSON):\n${JSON.stringify(result, null, 2)}`,
    "Rules: No sign-off. Concrete, specific, humane.",
  ].join("\n\n");
}

export const GOLDEN_SCENES = {
  l5_good_turn:
    "The neon rain quit like a snapped wire. He smiled, then the cop smiled wider. That's when she saw the badge wasn't his.",
  l6_revision_target:
    "She crosses the kitchen three times without touching the kettle. Each pass tightens the apology she will not make.",
};
export const GOLDEN_QUERIES = [
  {
    level: 5,
    writerType: "patterner" as WriterType,
    text: GOLDEN_SCENES.l5_good_turn,
  },
  {
    level: 6,
    writerType: "blueprint" as WriterType,
    text: GOLDEN_SCENES.l6_revision_target,
  },
];

// (No barrel changes here; src/copy/index.ts already exists from Prompt 2/3.)
