export function safeJSONParse<T = unknown>(s: string): { ok: true; value: T } | { ok: false; error: unknown } {
  try {
    return { ok: true, value: JSON.parse(s) as T };
  } catch (error) {
    return { ok: false, error };
  }
}

export function stripBOM(s: string) {
  return s.charCodeAt(0) === 0xFEFF ? s.slice(1) : s;
}
