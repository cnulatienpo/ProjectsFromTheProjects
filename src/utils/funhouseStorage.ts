const STORAGE_KEY = "funhouse_saves";

export interface FunhouseSaveEntry {
  id: string;
  variant: string;
  title: string;
  text: string;
  timestamp: number;
}

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function parseStoredValue(value: string | null): FunhouseSaveEntry[] {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as unknown;

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((entry) => {
        if (typeof entry !== "object" || entry === null) {
          return null;
        }

        const candidate = entry as Partial<FunhouseSaveEntry>;
        const id = typeof candidate.id === "string" ? candidate.id : null;
        const variant = typeof candidate.variant === "string" ? candidate.variant : null;
        const title = typeof candidate.title === "string" ? candidate.title : null;
        const text = typeof candidate.text === "string" ? candidate.text : null;
        const timestamp = typeof candidate.timestamp === "number" ? candidate.timestamp : null;

        if (!id || !variant || !title || text === null || timestamp === null) {
          return null;
        }

        return { id, variant, title, text, timestamp } as FunhouseSaveEntry;
      })
      .filter((entry): entry is FunhouseSaveEntry => entry !== null);
  } catch (error) {
    console.error("Failed to parse funhouse saves", error);
    return [];
  }
}

export function loadSaves(): FunhouseSaveEntry[] {
  if (!isBrowser()) {
    return [];
  }

  return parseStoredValue(window.localStorage.getItem(STORAGE_KEY));
}

export function saveEntry(entry: FunhouseSaveEntry): void {
  if (!isBrowser()) {
    return;
  }

  const saves = loadSaves();
  saves.push(entry);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(saves));
}

export function getSaveById(id: string): FunhouseSaveEntry | undefined {
  if (!id) {
    return undefined;
  }

  const saves = loadSaves();

  for (let index = saves.length - 1; index >= 0; index -= 1) {
    if (saves[index]?.id === id) {
      return saves[index];
    }
  }

  return undefined;
}
