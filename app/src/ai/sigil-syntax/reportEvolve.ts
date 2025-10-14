import type { RagResult } from '@/ai/sigil-syntax/lib/rag-types'

import {
  STYLE_REPORT_SCHEMA_VERSION,
  LEVEL_SPECS_PART1,
  type LevelSpec,
  type WriterType,
  buildEvalPrompt as buildEvalPromptPart1,
  buildMemoPrompt as buildMemoPromptPart1,
  applyWriterMods as applyWriterModsPart1,
} from '@/ai/sigil-syntax/copy/report-evolve.part1'
import {
  LEVEL_SPECS_PART2,
  buildEvalPrompt as buildEvalPromptPart2,
  buildMemoPrompt as buildMemoPromptPart2,
  applyWriterMods as applyWriterModsPart2,
  GOLDEN_SCENES,
  GOLDEN_QUERIES,
} from '@/ai/sigil-syntax/copy/report-evolve.part2'

export { STYLE_REPORT_SCHEMA_VERSION, GOLDEN_SCENES, GOLDEN_QUERIES }

export const LEVEL_SPECS: LevelSpec[] = [...LEVEL_SPECS_PART1, ...LEVEL_SPECS_PART2]

function isPart1(level: number) {
  return level <= LEVEL_SPECS_PART1[LEVEL_SPECS_PART1.length - 1].level
}

function partFor(level: number) {
  return isPart1(level) ? 'part1' : 'part2'
}

export function levelSpec(level: number): LevelSpec {
  return LEVEL_SPECS.find((row) => row.level === level) ?? LEVEL_SPECS[0]
}

export function applyWriterMods(spec: LevelSpec, writer?: WriterType): LevelSpec {
  if (partFor(spec.level) === 'part1') return applyWriterModsPart1(spec, writer)
  return applyWriterModsPart2(spec, writer)
}

export function buildEvalPrompt(args: {
  level: number
  writerType?: WriterType | null
  text: string
}): string {
  return partFor(args.level) === 'part1'
    ? buildEvalPromptPart1(args)
    : buildEvalPromptPart2(args)
}

export function buildMemoPrompt(
  result: RagResult,
  args: { level: number; writerType?: WriterType | null },
): string {
  return partFor(args.level) === 'part1'
    ? buildMemoPromptPart1(result, args)
    : buildMemoPromptPart2(result, args)
}

export function toEvolverInput(result: RagResult) {
  return {
    overall: result.overall,
    flags: result.flags,
    tips: result.tips,
    dimensions: result.dimensions,
  }
}
