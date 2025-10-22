export const attempts = globalThis.__MEM_ATTEMPTS || (globalThis.__MEM_ATTEMPTS = { rows: [] });
export const skips    = globalThis.__MEM_SKIPS    || (globalThis.__MEM_SKIPS    = { rows: [] });
export const mastery  = globalThis.__MEM_MASTERY  || (globalThis.__MEM_MASTERY  = { byUser: {} });
export default { attempts, skips, mastery };
