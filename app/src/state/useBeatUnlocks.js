// Minimal in-memory beat unlocks for dev.
const store = {
    unlocked: {},
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
            const s = store.unlocked[lessonId];
            return s ? { beats: Array.from(s.beats), colors: s.colors } : { beats: [], colors: undefined };
        }
    }
}
