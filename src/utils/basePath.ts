export function withBase(path: string) {
    const base = (import.meta as any).env?.BASE_URL || "/";
    const p = path.startsWith("/") ? path.slice(1) : path;
    return (base.endsWith("/") ? base : base + "/") + p;
}
