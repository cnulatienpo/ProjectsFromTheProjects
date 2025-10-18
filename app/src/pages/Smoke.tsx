import { useEffect, useState } from 'react';
import { api } from '@/lib/apiBase';

export default function Smoke() {
  const [out, setOut] = useState<any>({});

  useEffect(() => {
    (async () => {
      const result: any = { env: {
        DEV: import.meta.env.DEV,
        BASE_URL: import.meta.env.BASE_URL,
        VITE_ABS_API: import.meta.env.VITE_ABS_API
      }};
      try {
        result.health = await api.getJSON('/health');
      } catch (e:any) {
        result.health = { error: String(e) };
      }
      try {
        const cat = await api.getJSON('/sigil/catalog');
        result.catalog = { ok: true, count: Array.isArray(cat?.items) ? cat.items.length : 0 };
        result.firstId = cat?.items?.[0]?.id ?? null;
      } catch (e:any) {
        result.catalog = { error: String(e) };
      }
      setOut(result);
    })();
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <h1>Smoke Debug</h1>
      <pre style={{ whiteSpace:'pre-wrap' }}>{JSON.stringify(out, null, 2)}</pre>
    </div>
  );
}
