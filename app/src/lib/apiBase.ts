// Single source of truth for API base and helpers.
// Dev uses Vite proxy (''), prod uses VITE_ABS_API if set.

const ABS = import.meta.env.VITE_ABS_API?.trim()?.replace(/\/$/, '');
export const apiBase: string = import.meta.env.DEV ? '' : (ABS || '');

// Compose a full URL from a path
function toUrl(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${apiBase}${p}`;
}

// Safe JSON fetch
export async function safeFetchJSON<T = any>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const url = toUrl(path);
  const headers = new Headers({ Accept: 'application/json' });
  if (init?.headers) {
    const extra = new Headers(init.headers as HeadersInit);
    extra.forEach((value, key) => headers.set(key, value));
  }
  const res = await fetch(url, {
    ...init,
    headers,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json() as Promise<T>;
}

// Lightweight helper object
export const api = {
  getJSON: safeFetchJSON,
  get: safeFetchJSON,
};

// NOTE: No example usage or imports in this file.
