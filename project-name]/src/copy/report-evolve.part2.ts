// src/copy/report-evolve.part2.ts

export type WriterType = 'narrative' | 'expository' | 'descriptive' | 'persuasive';

export interface LevelSpec {
    level: number;
    description: string;
    criteria: string[];
}

export interface WriterMod {
    modification: string;
    impact: string;
}

export const LEVEL_SPECS_PART2: LevelSpec[] = [
    { level: 4, description: 'Advanced narrative techniques', criteria: ['Use of symbolism', 'Complex character development'] },
    { level: 5, description: 'In-depth analysis and critique', criteria: ['Critical thinking', 'Argumentation skills'] },
    { level: 6, description: 'Sophisticated descriptive language', criteria: ['Vivid imagery', 'Sensory details'] },
    { level: 7, description: 'Persuasive writing strategies', criteria: ['Emotional appeal', 'Logical reasoning'] },
    { level: 8, description: 'Research-based writing', criteria: ['Citing sources', 'Integrating evidence'] },
    { level: 9, description: 'Creative writing elements', criteria: ['Originality', 'Innovative structure'] },
    { level: 10, description: 'Mastery of writing styles', criteria: ['Adaptability', 'Voice and tone'] },
];

export const WRITER_MODS: Record<WriterType, WriterMod[]> = {
    narrative: [{ modification: 'Add character depth', impact: 'Enhances reader connection' }],
    expository: [{ modification: 'Incorporate data', impact: 'Strengthens arguments' }],
    descriptive: [{ modification: 'Use metaphors', impact: 'Creates vivid imagery' }],
    persuasive: [{ modification: 'Appeal to emotions', impact: 'Increases persuasiveness' }],
};

export const GOLDEN_SCENES = {
    level4: 'A character faces a moral dilemma that tests their values.',
    level5: 'An analysis of a controversial topic with multiple viewpoints.',
    level6: 'A scene that immerses the reader in a vibrant setting.',
    level7: 'A speech that sways the audience through emotional storytelling.',
    level8: 'An essay that integrates research findings seamlessly.',
    level9: 'A short story that breaks conventional narrative structures.',
    level10: 'A portfolio showcasing versatility across different writing styles.',
};

export const GOLDEN_QUERIES = [
    { query: 'How does the character’s journey reflect societal issues?', level: 4, writerType: 'narrative' },
    { query: 'What are the implications of the findings presented?', level: 5, writerType: 'expository' },
    { query: 'How does the setting influence the mood of the story?', level: 6, writerType: 'descriptive' },
    { query: 'What techniques make this argument compelling?', level: 7, writerType: 'persuasive' },
];