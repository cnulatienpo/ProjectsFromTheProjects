// src/copy/report-evolve.part1.ts

export type WriterType = 'author' | 'editor' | 'reviewer';

export interface LevelSpec {
    level: number;
    description: string;
    criteria: string[];
}

export interface WriterMod {
    type: WriterType;
    modifications: string[];
}

export const STYLE_REPORT_SCHEMA_VERSION = "1.0.0";

export const LEVEL_SPECS_PART1: LevelSpec[] = [
    { level: 1, description: "Beginner level", criteria: ["Basic understanding", "Simple tasks"] },
    { level: 2, description: "Intermediate level", criteria: ["Moderate understanding", "Complex tasks"] },
    { level: 3, description: "Advanced level", criteria: ["Deep understanding", "Challenging tasks"] }
];

export function applyWriterMods(levelSpec: LevelSpec, mods: WriterMod[]): LevelSpec {
    // Apply modifications to the level specification
    mods.forEach(mod => {
        if (mod.type === 'author') {
            // Apply author-specific modifications
        } else if (mod.type === 'editor') {
            // Apply editor-specific modifications
        } else if (mod.type === 'reviewer') {
            // Apply reviewer-specific modifications
        }
    });
    return levelSpec;
}

export function buildEvalPrompt(levelSpec: LevelSpec, additionalInfo: string): string {
    return `Evaluate the following for level ${levelSpec.level}: ${levelSpec.description}. ${additionalInfo}`;
}

export function buildMemoPrompt(result: string, additionalArgs: string[]): string {
    return `Memo: ${result}. Additional notes: ${additionalArgs.join(', ')}`;
}