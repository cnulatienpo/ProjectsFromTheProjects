import { useMemo, useRef, useState } from "react";
import { useProgress } from "../state/useProgress";
import type { WordEntry } from "../data/validateAndNormalize";
import { rng } from "../utils/rng";

export function useGameDeck(all: WordEntry[], opts?: { includeSeen?: boolean }) {
  const includeSeen = opts?.includeSeen ?? false;
  const seen = useProgress((s) => s.seen);
  const pool = useMemo(
    () => all.filter((e) => includeSeen || !seen[e.word]),
    [all, includeSeen, seen]
  );
  const index = useRef(0);
  const [nonce, setNonce] = useState(0);

  function randomize() {
    if (!pool.length) return;
    index.current = rng().randint(0, pool.length - 1);
  }

  function current() {
    return pool.length ? pool[index.current % pool.length] : null;
  }

  function next() {
    randomize();
    setNonce((n) => n + 1);
    return current();
  }

  if (pool.length && nonce === 0 && index.current === 0) randomize();

  return { current: current(), next, left: pool.length, total: all.length, nonce };
}
