import { useCallback, useMemo, useSyncExternalStore } from "react";
import { load, save } from "@/lib/storage";
import { BeatButton, hashColor, titleCase } from "@/lib/beatTypes";

type Store = {
  buttons: Record<string, BeatButton>;
  hidden: string[];
  order: string[];
};

const KEY = "unlocks";

let store: Store = load<Store>(KEY, { buttons: {}, hidden: [], order: [] });
const subs = new Set<() => void>();

function emit() {
  subs.forEach((fn) => fn());
  save(KEY, store);
}

export function useBeatUnlocks() {
  const subscribe = useCallback((fn: () => void) => {
    subs.add(fn);
    return () => subs.delete(fn);
  }, []);

  const getSnapshot = useCallback(() => store, []);

  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const unlockBeats = useCallback(
    (lessonId: string, beats: string[], emoticonColor?: Record<string, string>) => {
      const now = Date.now();
      let changed = false;
      for (const id of beats) {
        if (!id) continue;
        if (!store.buttons[id]) {
          const color = emoticonColor?.[id] ?? hashColor(id);
          store.buttons[id] = {
            id,
            label: titleCase(id),
            color,
            firstSeenIn: lessonId,
            unlockedAt: now,
          };
          store.order.push(id);
          changed = true;
        } else if (emoticonColor?.[id] && store.buttons[id].color !== emoticonColor[id]) {
          store.buttons[id] = { ...store.buttons[id], color: emoticonColor[id] };
          changed = true;
        }
      }
      if (changed) emit();
    },
    []
  );

  const hideBeat = useCallback((id: string) => {
    if (!store.hidden.includes(id)) {
      store.hidden = [...store.hidden, id];
      emit();
    }
  }, []);

  const showBeat = useCallback((id: string) => {
    if (store.hidden.includes(id)) {
      store.hidden = store.hidden.filter((x) => x !== id);
      emit();
    }
  }, []);

  const visibleButtons = useMemo(
    () =>
      store.order
        .filter((id) => !store.hidden.includes(id))
        .map((id) => store.buttons[id]),
    [snapshot]
  );

  const hiddenButtons = useMemo(
    () =>
      store.order
        .filter((id) => store.hidden.includes(id))
        .map((id) => store.buttons[id]),
    [snapshot]
  );

  return {
    buttons: store.buttons,
    order: store.order,
    visibleButtons,
    hiddenButtons,
    unlockBeats,
    hideBeat,
    showBeat,
  };
}

export function listUnlockedBeats(): string[] {
  return [...store.order];
}
