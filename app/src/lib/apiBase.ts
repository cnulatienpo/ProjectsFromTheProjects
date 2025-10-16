const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');
const ensureLeadingSlash = (value: string) => {
  if (!value) return '';
  return value.startsWith('/') ? value : `/${value}`;
};

const resolveFromEnv = () => {
  const raw = import.meta.env.VITE_DEV_API?.toString().trim();
  return raw ? trimTrailingSlash(raw) : '';
};

const resolveCodespacesBase = () => {
  if (typeof window === 'undefined') return '';
  const { origin, host } = window.location;
  if (!host?.includes('.app.github.dev')) return '';
  return trimTrailingSlash(origin.replace(/-\d+\.app\.github\.dev$/, '-3001.app.github.dev'));
};

/**
 * Pick the backend base URL in dev (env > Codespaces guess > relative).
 */
export const apiBase = (() => {
  return resolveFromEnv() || resolveCodespacesBase() || '';
})();

export const api = (path = ''): string => {
  if (!path) return apiBase;
  const normalized = ensureLeadingSlash(path);
  return apiBase ? `${apiBase}${normalized}` : normalized;
};

type HeadersInput = RequestInit['headers'];

type HeaderRecord = Record<string, string>;

const normalizeHeaders = (input?: HeadersInput): HeaderRecord => {
  if (!input) return {};
  if (typeof Headers !== 'undefined' && input instanceof Headers) {
    const record: HeaderRecord = {};
    input.forEach((value, key) => {
      record[key] = value;
    });
    return record;
  }
  if (Array.isArray(input)) {
    return input.reduce<HeaderRecord>((acc, [key, value]) => {
      acc[key] = value as string;
      return acc;
    }, {});
  }
  return { ...input } as HeaderRecord;
};

const ensureAcceptHeader = (headers: HeaderRecord): HeaderRecord => {
  const hasAccept = Object.keys(headers).some((key) => key.toLowerCase() === 'accept');
  if (!hasAccept) headers['Accept'] = 'application/json';
  return headers;
};

const toUrl = (path: string): string => {
  if (!path) return api('');
  return /^https?:\/\//i.test(path) ? path : api(path);
};

export async function safeFetchJSON(path: string, init: RequestInit = {}) {
  const headers = ensureAcceptHeader(normalizeHeaders(init.headers));
  const response = await fetch(toUrl(path), { ...init, headers });
  const contentType = response.headers.get('content-type') || '';

  if (!response.ok) {
    let message = `HTTP ${response.status} for ${path}`;
    if (contentType.includes('application/json')) {
      try {
        const payload = await response.clone().json();
        const extra = payload?.error || payload?.message;
        if (extra) message += `: ${extra}`;
      } catch {
        // ignore parse error
      }
    }
    throw new Error(message);
  }

  if (!contentType.includes('application/json')) {
    throw new Error(`Expected JSON but received ${contentType || 'unknown content type'}`);
  }

  return response.json();
}

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
