const API_BASE = ''; // same-origin

export const api = {
  get(path, opts = {}) {
    const headers = { ...(opts.headers || {}), 'x-user-id': opts.userId || 'dev' };
    return fetch(`${API_BASE}${path}`, { method: 'GET', headers });
  },
  post(path, body, opts = {}) {
    const headers = {
      'content-type': 'application/json',
      ...(opts.headers || {}),
      'x-user-id': opts.userId || 'dev',
    };
    return fetch(`${API_BASE}${path}`, { method: 'POST', headers, body: JSON.stringify(body) });
  },
};

export async function safeFetchJSON(respOrPromise) {
  const resp = respOrPromise instanceof Response ? respOrPromise : await respOrPromise;
  const ct = resp.headers.get('content-type') || '';
  const isJSON = ct.includes('application/json');
  const data = isJSON ? await resp.json() : await resp.text();
  if (!resp.ok) {
    const err = new Error(`HTTP ${resp.status}`);
    err.status = resp.status;
    err.data = data;
    throw err;
  }
  return data;
}

// Convenience wrappers
export const getJSON = (path, opts) => safeFetchJSON(api.get(path, opts));
export const postJSON = (path, body, opts) => safeFetchJSON(api.post(path, body, opts));

export { API_BASE };
export default { api, safeFetchJSON, getJSON, postJSON, API_BASE };
