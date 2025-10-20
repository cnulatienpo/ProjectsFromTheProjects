import { useRef } from "react";

export function useUndo<T>(initial: T) {
  const past = useRef<T[]>([]);
  const future = useRef<T[]>([]);
  const current = useRef<T>(initial);

  const get = () => current.current;
  const set = (next: T) => {
    past.current.push(current.current);
    current.current = next;
    future.current = [];
  };
  const undo = () => {
    const prev = past.current.pop();
    if (prev !== undefined) {
      future.current.push(current.current);
      current.current = prev;
    }
    return current.current;
  };
  const redo = () => {
    const next = future.current.pop();
    if (next !== undefined) {
      past.current.push(current.current);
      current.current = next;
    }
    return current.current;
  };
  const reset = (next: T) => {
    past.current = [];
    future.current = [];
    current.current = next;
  };

  return { get, set, undo, redo, reset };
}
