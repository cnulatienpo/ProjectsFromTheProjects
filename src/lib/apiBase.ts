const ABS = import.meta.env.VITE_ABS_API?.toString().trim();
export const apiBase = ABS ? ABS.replace(/\/$/, "") : "";
