// Use absolute API only when you explicitly set VITE_ABS_API.
// Otherwise use relative (lets Vite proxy kill CORS in dev).
const ABS = import.meta.env.VITE_ABS_API?.trim();
export const apiBase = ABS ? ABS.replace(/\/$/, '') : '';
