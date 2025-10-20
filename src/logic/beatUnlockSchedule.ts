// Cumulative unlocks keyed by lesson number (inclusive threshold).
// Once unlocked, a beat stays available for the rest of the game.

export type BeatId = string;

// Canonical ids (lowercase, kebab where needed). Keep these stable.
const THEME_BEATS: BeatId[] = [
    'thematic-statement',
    'counterpoint',
    'test-of-belief',
    'transformation',
    'mirror-thematic',
    'sacrifice',
    'revelation-thematic',
    'resolution-thematic',
];

// Lesson thresholds → beats added at that moment
const SCHEDULE: Record<number, BeatId[]> = {
    71: ['action', 'reaction', 'decision', 'revelation'], // Core Four
    86: [...THEME_BEATS],                                  // "at least thematic ones"
    89: ['conflict', 'obstacle', 'climax', 'resolution'],
    92: ['reveal', 'realization', 'exposition', 'foreshadow', 'setup', 'payoff'],
    94: [
        'emotion', 'suppression', 'vulnerability', 'power', 'shift', 'intimacy', 'alienation',
        'dialogue', 'nonverbal', 'interaction', 'agreement', 'disagreement', 'test'
    ],
    96: [
        'atmosphere', 'discovery', 'loss', 'arrival', 'departure', 'transition',
        'inciting', 'turning-point', 'mirror', 'bridge', 'suspense', 'release'
    ],
    98: [...THEME_BEATS], // repeats are safe (no-ops if already unlocked)
};

// Typos/variants → canonical ids (we accept your spellings and clean them)
const ALIAS: Record<string, string> = {
    // common typos from the brief
    obstical: 'obstacle',
    dialouge: 'dialogue',
    sacrafice: 'sacrifice',
    revalation: 'revelation-thematic',
    'turning point': 'turning-point',
    // thematic mirror vs general mirror
    'mirror (thematic)': 'mirror-thematic',
};

// Expose a normalizer (lowercase, trim, kebab-ish)
export function normalizeBeat(id: string): BeatId {
    const raw = (id || '').toLowerCase().trim();
    if (!raw) return '';
    const alias = ALIAS[raw] || ALIAS[raw.replace(/\s+/g, ' ')] || raw;
    return alias.replace(/[ _]/g, '-');
}

// Given a lesson number, return the full cumulative set to unlock now.
export function beatsForLesson(lessonNumber: number): BeatId[] {
    const all = new Set<BeatId>();
    const thresholds = Object.keys(SCHEDULE).map(n => parseInt(n, 10)).sort((a, b) => a - b);
    for (const n of thresholds) {
        if (lessonNumber >= n) {
            for (const b of SCHEDULE[n]) all.add(normalizeBeat(b));
        }
    }
    return Array.from(all);
}

// Convenience: just the new beats added at this lesson (non-cumulative)
export function newBeatsAt(lessonNumber: number): BeatId[] {
    return (SCHEDULE[lessonNumber] || []).map(normalizeBeat);
}
