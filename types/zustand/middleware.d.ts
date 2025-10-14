import type { StateCreator } from "zustand";

export function persist<T>(creator: StateCreator<T>, options: any): StateCreator<T>;
export function createJSONStorage<T>(getStorage: () => Storage): any;
