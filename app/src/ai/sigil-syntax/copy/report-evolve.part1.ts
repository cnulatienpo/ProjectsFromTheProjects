import type { RagResult } from '@/ai/sigil-syntax/lib/rag-types'

let P: any = {}
let S: any = {}
try {
  P = require('@/ai/sigil-syntax/copy/prompts')
} catch {}
try {
  S = require('@/ai/sigil-syntax/copy/snippets')
} catch {}

export type WriterType =
  | 'blueprint'
  | 'thief'
  | 'actor'
  | 'patterner'
  | 'sprinter'
  | 'gardener'
  | 'worldbuilder'
  | 'minimalist'
  | 'maximalist'
  | 'experimental'

export type LevelSpec = {
  level: number
  tone: 'warm' | 'collegial' | 'professorial' | 'editorial'
  dimensions: Array<{
    name: string
    key: string
    weight: number
    guidance: string
    examples?: string[]
  }>
  flags?: string[]
  memoSections: string[]
}

export type WriterMod = {
  weightBoost?: Partial<Record<string, number>>
  memoHints?: string[]
  toneNudge?: Partial<Record<LevelSpec['tone'], LevelSpec['tone']>>
}

export const STYLE_REPORT_SCHEMA_VERSION = 'sr/2.0.0'

export const LEVEL_SPECS_PART1: LevelSpec[] = [
  {
    level: 1,
    tone: 'warm',
    dimensions: [
      {
        name: 'Voice',
        key: 'voice',
        weight: 0.35,
        guidance: 'Diction/rhythm/POV show human choice.',
      },
      {
        name: 'Devices',
        key: 'devices',
        weight: 0.2,
        guidance: 'One deliberate device appears.',
      },
      {
        name: 'Clarity',
        key: 'clarity',
        weight: 0.45,
        guidance: 'Who/where/what clear on first read.',
      },
    ],
    flags: ['unclear subject', 'vagueness fog'],
    memoSections: ['Voice', 'Devices', 'Clarity', 'Next-Draft Focus'],
  },
  {
    level: 2,
    tone: 'warm',
    dimensions: [
      {
        name: 'Scene Logic',
        key: 'logic',
        weight: 0.4,
        guidance: 'Goal/obstacle/turn present.',
      },
      {
        name: 'Clarity',
        key: 'clarity',
        weight: 0.3,
        guidance: 'Concrete grounding beats.',
      },
      {
        name: 'Voice',
        key: 'voice',
        weight: 0.3,
        guidance: 'Choices are consistent, not pasted.',
      },
    ],
    flags: ['no turn', 'flat tension'],
    memoSections: ['Scene Logic', 'Voice', 'Clarity', 'Next-Draft Focus'],
  },
  {
    level: 3,
    tone: 'collegial',
    dimensions: [
      {
        name: 'Character Depth',
        key: 'char',
        weight: 0.35,
        guidance: 'Internal pressure legible; micro-decisions visible.',
      },
      {
        name: 'Structure',
        key: 'structure',
        weight: 0.3,
        guidance: 'Entry/exit beats; cause→effect.',
      },
      {
        name: 'Voice',
        key: 'voice',
        weight: 0.35,
        guidance: 'Voice holds under pressure.',
      },
    ],
    flags: ['goal drift', 'talking heads'],
    memoSections: ['Character & Structure', 'Voice', 'Next-Draft Focus'],
  },
]

export function applyWriterMods(spec: LevelSpec, _writer?: WriterType): LevelSpec {
  return spec
}

function fallbackSystem() {
  return 'You are a concise literary evaluator.'
}

function fallbackJSONRule() {
  return 'Return strict JSON: overall, dimensions[], flags[], tips[], citations[], evidence[].'
}

export function buildEvalPrompt(args: {
  level: number
  writerType?: WriterType | null
  text: string
}): string {
  const base = P.systemEvaluator ?? fallbackSystem()
  const constraints = P.jsonConstraintV2 ?? fallbackJSONRule()
  const spec = LEVEL_SPECS_PART1.find((s) => s.level === args.level) ?? LEVEL_SPECS_PART1[0]
  const dims = spec.dimensions
    .map((d) => `- ${d.name} [${d.key}] w=${d.weight.toFixed(2)}: ${d.guidance}`)
    .join('\n')
  const examples = Array.isArray(S.examplesV2) ? S.examplesV2.join('\n\n') : ''
  return [
    base,
    constraints,
    `LEVEL ${spec.level} — tone:${spec.tone}`,
    `DIMENSIONS:\n${dims}`,
    `TEXT:\n${args.text}`,
    examples ? `EXAMPLES:\n${examples}` : '',
  ]
    .filter(Boolean)
    .join('\n\n')
}

export function buildMemoPrompt(
  result: RagResult,
  args: { level: number; writerType?: WriterType | null },
): string {
  const spec = LEVEL_SPECS_PART1.find((s) => s.level === args.level) ?? LEVEL_SPECS_PART1[0]
  const order = spec.memoSections.join(' | ')
  const sys =
    P.systemMemo?.(spec.tone) ?? `Write like a supportive instructor (tone: ${spec.tone}).`
  return [
    sys,
    `Schema:${STYLE_REPORT_SCHEMA_VERSION}`,
    `Sections in order: ${order}`,
    `Numbers & Evidence (JSON):\n${JSON.stringify(result, null, 2)}`,
    'Rules: No sign-off. Concrete, specific, humane.',
  ].join('\n\n')
}
