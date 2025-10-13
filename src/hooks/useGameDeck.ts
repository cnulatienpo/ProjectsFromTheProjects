import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useProgress } from "../state/useProgress";
import type { WordEntry } from "../data/validateAndNormalize";

export function useGameDeck(all: WordEntry[], opts?: { includeSeen?: boolean }) {
  const includeSeen = opts?.includeSeen ?? false;
  const seen = useProgress((s) => s.seen);
  const pool = useMemo(
    () => all.filter((e) => includeSeen || !seen[e.word]),
    [all, includeSeen, seen]
  );
  const idx = useRef(0);
  const [nonce, setNonce] = useState(0);

  const randomize = useCallback(() => {
    if (pool.length) {
      idx.current = Math.floor(Math.random() * pool.length);
    }
  }, [pool]);

  const current = useCallback(() => {
    return pool.length ? pool[idx.current % pool.length] : null;
  }, [pool]);

  const next = useCallback(() => {
    randomize();
    setNonce((n) => n + 1);
    return current();
  }, [current, randomize]);

  useEffect(() => {
    if (pool.length) {
      randomize();
      setNonce((n) => n + 1);
    } else {
      idx.current = 0;
      setNonce((n) => n + 1);
    }
  }, [pool, randomize]);

  return { current: current(), next, left: pool.length, total: all.length, nonce };
}
