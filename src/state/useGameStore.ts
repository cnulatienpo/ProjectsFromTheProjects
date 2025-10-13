import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface GameState {
  points: number;
  streak: number;
  seen: Record<string, boolean>;
  addPoints: (n: number) => void;
  markSeen: (word: string) => void;
  reset: () => void;
}

const initialState: Pick<GameState, 'points' | 'streak' | 'seen'> = {
  points: 0,
  streak: 0,
  seen: {}
};

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      ...initialState,
      addPoints: (n) =>
        set((state) => ({
          points: state.points + n,
          streak: n > 0 ? state.streak + 1 : 0
        })),
      markSeen: (word) =>
        set((state) => ({
          seen: { ...state.seen, [word]: true }
        })),
      reset: () => set(() => ({ ...initialState }))
    }),
    {
      name: 'good-word:v1',
      storage: createJSONStorage(() => {
        if (typeof window === 'undefined') {
          return {
            getItem: () => null,
            setItem: () => undefined,
            removeItem: () => undefined,
            clear: () => undefined,
            key: (_index: number) => null,
            length: 0
          } as Storage;
        }
        return window.localStorage;
      })
    }
  )
);
