const NS = "ld.beatspawner";

export function load<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(`${NS}.${key}`);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function save<T>(key: string, value: T) {
  try {
    localStorage.setItem(`${NS}.${key}`, JSON.stringify(value));
  } catch {
    // noop
  }
}
