import React from 'react';

export default function DebugPanel(props: { source:string; count:number; sample:any; apiBase:string }) {
  const { source, count, sample, apiBase } = props;
  const q = new URLSearchParams(window.location.search);
  const on = q.get('debug') === '1';
  if (!on) return null;
  return (
    <details open className="surface" style={{ padding:'12px', margin:'12px 0', border:'1px solid var(--border,#333)' }}>
      <summary><strong>Debug</strong></summary>
      <div>apiBase: <code>{apiBase || '(relative)'}</code></div>
      <div>source: <code>{source}</code></div>
      <div>items: <code>{count}</code></div>
      <pre style={{whiteSpace:'pre-wrap',fontSize:12,opacity:.9}}>
{JSON.stringify(sample, null, 2)}
      </pre>
    </details>
  );
}
