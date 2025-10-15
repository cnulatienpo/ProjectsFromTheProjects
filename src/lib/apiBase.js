const PROD = import.meta.env.VITE_PROD_API || '';
export const api = (p = '') => {
    const base = (import.meta.env.DEV ? '' : PROD).replace(/\/+$/, '');
    return `${base}${p.startsWith('/') ? p : `/${p}`}`;
};
