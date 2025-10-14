export interface StoreApi<T> {
  getState(): T;
  setState(partial: Partial<T> | ((state: T) => Partial<T>), replace?: boolean): void;
  subscribe(listener: (state: T, prevState: T) => void): () => void;
}

export type StateCreator<T> = (
  set: StoreApi<T>["setState"],
  get: StoreApi<T>["getState"],
  api: StoreApi<T>,
) => T;

export type Store<T> = ((selector?: (state: T) => any) => any) & StoreApi<T>;

export function create<T>(): (creator: StateCreator<T>) => Store<T>;
export function create<T>(creator: StateCreator<T>): Store<T>;
