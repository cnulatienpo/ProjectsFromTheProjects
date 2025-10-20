// Minimal in-memory beat unlocks for dev.
const store = {
    unlocked: {
        'lesson-71': {
            beats: new Set(['action', 'dialogue', 'description', 'emotion', 'reflection']),
            colors: { action: '#ff6b6b', dialogue: '#4ecdc4', description: '#45b7d1', emotion: '#f9ca24', reflection: '#6c5ce7' }
        }
    }
};

export function useBeatUnlocks() {
    return {
        unlockBeats(lessonId, beats = [], colors) {
            if (!lessonId) return;
            store.unlocked[lessonId] = store.unlocked[lessonId] || { beats: new Set(), colors };
            for (const b of beats) store.unlocked[lessonId].beats.add(b);
            console.log('[useBeatUnlocks] unlocked', lessonId, Array.from(store.unlocked[lessonId].beats), colors);
        },
        getUnlocked(lessonId) {
            const unlocked = store.unlocked[lessonId];
            if (!unlocked) return { beats: [], colors: {} };

            return {
                beats: Array.from(unlocked.beats),
                colors: unlocked.colors || {}
            };
        }
    }
}
