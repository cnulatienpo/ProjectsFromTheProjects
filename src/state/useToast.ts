import { create } from "zustand";
import { rng } from "../utils/rng";

type Toast = { id: number; text: string };

type ToastStore = {
  toasts: Toast[];
  push: (text: string) => void;
  remove: (id: number) => void;
};

export const useToast = create<ToastStore>((set) => ({
  toasts: [],
  push: (text) =>
    set((state) => {
      const id = Date.now() + rng().random();
      if (typeof window !== "undefined") {
        window.setTimeout(() => useToast.getState().remove(id), 2000);
      }
      return { toasts: [...state.toasts, { id, text }] };
    }),
  remove: (id) => set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),
}));
