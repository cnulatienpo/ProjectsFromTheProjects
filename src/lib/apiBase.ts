const ABS = import.meta.env.VITE_ABS_API?.trim();
export const apiBase = ABS ? ABS.replace(/\/$/, '') : '';
