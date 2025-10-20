export const THEME_BEATS = [
    'thematic-statement', 'counterpoint', 'test-of-belief', 'transformation',
    'mirror-thematic', 'sacrifice', 'revelation-thematic', 'resolution-thematic'
];

const SCHEDULE = {
    71: ['action', 'reaction', 'decision', 'revelation'],
    86: [...THEME_BEATS],
    89: ['conflict', 'obstacle', 'climax', 'resolution'],
    92: ['reveal', 'realization', 'exposition', 'foreshadow', 'setup', 'payoff'],
    94: ['emotion', 'suppression', 'vulnerability', 'power', 'shift', 'intimacy', 'alienation',
        'dialogue', 'nonverbal', 'interaction', 'agreement', 'disagreement', 'test'],
    96: ['atmosphere', 'discovery', 'loss', 'arrival', 'departure', 'transition',
        'inciting', 'turning-point', 'mirror', 'bridge', 'suspense', 'release'],
    98: [...THEME_BEATS],
};

const ALIAS = {
    obstical: 'obstacle', dialouge: 'dialogue', sacrafice: 'sacrifice',
    'turning point': 'turning-point', 'mirror (thematic)': 'mirror-thematic',
    revalation: 'revelation-thematic'
};

export function normalizeBeat(id = '') {
    const raw = String(id || '').toLowerCase().trim();
    const a = ALIAS[raw] || ALIAS[raw.replace(/\s+/g, ' ')] || raw;
    return a.replace(/[ _]/g, '-');
}

export function beatsForLesson(n = 0) {
    const all = new Set();
    Object.keys(SCHEDULE).map(Number).sort((a, b) => a - b).forEach(k => {
        if (n >= k) { SCHEDULE[k].forEach(b => all.add(normalizeBeat(b))); }
    });
    return [...all];
}
