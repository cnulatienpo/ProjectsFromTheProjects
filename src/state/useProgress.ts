import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type ProgressState = {
  points: number;
  seen: Record<string, true>;
  used: Record<string, true>;
  addPoints: (n: number) => void;
  markSeen: (word: string) => void;
  markUsed: (word: string) => void;
  resetProgress: () => void;
};

export const useProgress = create<ProgressState>()(
  persist(
    (set, get) => ({
      points: 0,
      seen: {},
      used: {},
      addPoints: (n) => set({ points: Math.max(0, get().points + n) }),
      markSeen: (word) =>
        set((s) => {
          if (s.seen[word]) return s;
          return { seen: { ...s.seen, [word]: true } };
        }),
      markUsed: (word) =>
        set((s) => {
          const next: ProgressState = {
            ...s,
            used: { ...s.used, [word]: true },
            seen: s.seen[word] ? s.seen : { ...s.seen, [word]: true },
          };
          return next;
        }),
      resetProgress: () => set({ points: 0, seen: {}, used: {} }),
    }),
    {
      name: "good-word:progress:v1",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
);

export function isSeen(word: string) {
  return !!useProgress.getState().seen[word];
}

export function isUsed(word: string) {
  return !!useProgress.getState().used[word];
}
