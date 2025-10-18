import React, { useEffect, useState } from 'react';

type Ping = { ok?: boolean; status?: number; body?: any; error?: string; url?: string };

export default function DebugDashboard() {
  const [env, setEnv] = useState<any>({});
  const [who, setWho] = useState<string>('');
  const [basename, setBasename] = useState<string>('');
  const [catalogPing, setCatalogPing] = useState<Ping>({});
  const [healthPing, setHealthPing] = useState<Ping>({});
  const [apiDebug, setApiDebug] = useState<any>(null);

  useEffect(() => {
    setWho(window.location.origin);
    setBasename(import.meta.env.BASE_URL || '/');
    setEnv({
      DEV: import.meta.env.DEV,
      MODE: import.meta.env.MODE,
      BASE_URL: import.meta.env.BASE_URL,
      VITE_DEV_API: import.meta.env.VITE_DEV_API,
      VITE_ABS_API: import.meta.env.VITE_ABS_API,
      VITE_PAGES_BASE: (import.meta as any).env?.VITE_PAGES_BASE
    });

    (async () => {
      const apiBase = import.meta.env.DEV
        ? '' // relative in dev to use Vite proxy
        : (import.meta.env.VITE_ABS_API?.trim()?.replace(/\/$/, '') ?? '');

      // exact URL the app will hit for catalog:
      const url = `${apiBase}/sigil/catalog`;
      try {
        const r = await fetch(url, { headers: { Accept: 'application/json' }});
        const body = await r.json().catch(() => '[non-json]');
        setCatalogPing({ ok: r.ok, status: r.status, body, url });
      } catch (e:any) {
        setCatalogPing({ ok: false, status: 0, error: String(e), url });
      }

      // backend health (relative in dev)
      try {
        const r = await fetch('/health', { headers: { Accept: 'application/json' }});
        const body = await r.json().catch(() => '[non-json]');
        setHealthPing({ ok: r.ok, status: r.status, body, url: '/health' });
      } catch (e:any) {
        setHealthPing({ ok: false, status: 0, error: String(e), url: '/health' });
      }

      // API debug (relative in dev)
      try {
        const r = await fetch('/_debug/api', { headers: { Accept: 'application/json' }});
        const body = await r.json().catch(() => '[non-json]');
        setApiDebug(body);
      } catch {}
    })();
  }, []);

  const Box = (p: any) => (
    <div className="surface" style={{ padding: 12, margin: '8px 0', border: '1px solid var(--border,#333)' }}>
      {p.children}
    </div>
  );

  return (
    <div style={{padding:16}}>
      <h1>Debug Dashboard</h1>
      <Box><strong>Origin:</strong> <code>{who}</code></Box>
      <Box><strong>Router basename:</strong> <code>{basename}</code></Box>
      <Box><pre style={{whiteSpace:'pre-wrap'}}>{JSON.stringify(env, null, 2)}</pre></Box>
      <Box>
        <h3 style={{marginTop:0}}>Catalog fetch</h3>
        <div><strong>URL:</strong> <code>{catalogPing.url}</code></div>
        <div><strong>Status:</strong> {catalogPing.status}</div>
        <pre style={{whiteSpace:'pre-wrap',fontSize:12,opacity:.9}}>
{JSON.stringify(catalogPing.body ?? catalogPing.error, null, 2)}
        </pre>
      </Box>
      <Box>
        <h3 style={{marginTop:0}}>Backend /health</h3>
        <div><strong>URL:</strong> <code>{healthPing.url}</code></div>
        <div><strong>Status:</strong> {healthPing.status}</div>
        <pre style={{whiteSpace:'pre-wrap',fontSize:12,opacity:.9}}>
{JSON.stringify(healthPing.body ?? healthPing.error, null, 2)}
        </pre>
      </Box>
      <Box>
        <h3 style={{marginTop:0}}>/_debug/api</h3>
        <pre style={{whiteSpace:'pre-wrap',fontSize:12,opacity:.9}}>
{JSON.stringify(apiDebug, null, 2)}
        </pre>
      </Box>
    </div>
  );
}
