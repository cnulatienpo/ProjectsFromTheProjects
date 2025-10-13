import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type FirstRunState = {
  seenWelcome: boolean;
  markSeen: () => void;
  resetWelcome: () => void;
};

export const useFirstRun = create<FirstRunState>()(
  persist(
    (set) => ({
      seenWelcome: false,
      markSeen: () => set({ seenWelcome: true }),
      resetWelcome: () => set({ seenWelcome: false }),
    }),
    { name: "good-word:first-run:v1", storage: createJSONStorage(() => localStorage) }
  )
);
