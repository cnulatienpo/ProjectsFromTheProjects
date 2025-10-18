const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');
const ensureLeadingSlash = (value: string) => {
  if (!value) return '';
  return value.startsWith('/') ? value : `/${value}`;
};

const resolveFromEnv = () => {
  const raw = (import.meta.env.VITE_DEV_API as string | undefined)?.trim();
  return raw ? trimTrailingSlash(raw) : '';
};

const resolveCodespacesBase = () => {
  if (typeof window === 'undefined') return '';
  const { origin, host } = window.location;
  if (!host?.includes('.app.github.dev')) return '';
  return trimTrailingSlash(origin.replace(/-\d+\.app\.github.dev$/, '-3001.app.github.dev'));
};

const ABS = (import.meta.env.VITE_ABS_API as string | undefined)?.trim();
export const apiBase = import.meta.env.DEV ? '' : (ABS ? ABS.replace(/\/$/, '') : '');

/**
 * Pick the backend base URL in dev (env > Codespaces guess > relative).
 */
export const api = (() => {
  const base = resolveFromEnv() || resolveCodespacesBase() || '';
  return (path: string) => {
    if (!path.startsWith('/')) path = '/' + path;
    // In dev, return relative so Vite proxy handles it; in prod prepend ABS if set
    return (import.meta.env.DEV ? '' : (ABS ? ABS.replace(/\/$/, '') : '')) + (base && !import.meta.env.DEV ? base + path : path);
  };
})();

/** Helper that fetches JSON and throws a helpful error on non-JSON or non-OK responses */
export async function safeFetchJSON(input: RequestInfo | string, init?: RequestInit): Promise<any> {
  const url = typeof input === 'string' ? input : input;
  const r = await fetch(url, init);
  if (!r.ok) throw new Error(`HTTP ${r.status} for ${typeof url === 'string' ? url : ''}`);
  const ct = r.headers.get('content-type') || '';
  if (!ct.includes('application/json')) throw new Error(`Invalid content-type ${ct}`);
  return r.json();
}

// example usage in a component
import { api, safeFetchJSON } from '@/lib/apiBase';

useEffect(() => {
  safeFetchJSON(api('/sigil/catalog'))
    .then(j => { /* handle JSON */ })
    .catch(e => { /* handle error */ });
}, []);

// one-time console breadcrumb (useful in dev to verify the chosen base)
if (typeof window !== 'undefined') {
  const marker = '__PFTP_API_BASE_LOGGED__';
  const scope = window as unknown as Record<string, boolean>;
  if (!scope[marker]) {
    scope[marker] = true;
    const label = apiBase || '(relative via Vite proxy)';
    console.log('[apiBase]', label);
  }
}
