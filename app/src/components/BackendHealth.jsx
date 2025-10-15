import React, { useEffect, useMemo, useRef, useState } from 'react'
import { api, safeFetchJSON } from '@/lib/apiBase.js'

function useInterval(fn, ms) {
  const ref = useRef(fn)
  useEffect(() => { ref.current = fn }, [fn])
  useEffect(() => {
    const id = setInterval(() => ref.current(), ms)
    return () => clearInterval(id)
  }, [ms])
}

export default function BackendHealth({ className = '', intervalMs = 10000 }) {
  const [status, setStatus] = useState({ ok: false, msg: 'Checking…', ts: null })

  const backendBase = useMemo(() => {
    const isDev = import.meta.env.DEV
    const prod = (import.meta.env.VITE_PROD_API || '').replace(/\/+$/, '')
    return isDev ? '(dev proxy)' : (prod || '(no VITE_PROD_API)')
  }, [])

  async function check() {
    try {
      const j = await safeFetchJSON(api('/health'))
      setStatus({ ok: !!j?.ok, msg: j?.ok ? 'OK' : 'Not OK', ts: j?.ts || new Date().toISOString() })
    } catch (e) {
      setStatus({ ok: false, msg: String(e.message || e), ts: new Date().toISOString() })
    }
  }

  useEffect(() => { check() }, [])
  useInterval(check, intervalMs)

  const good = status.ok
  return (
    <div
      className={className}
      style={{
        position: 'fixed',
        bottom: 8,
        right: 8,
        zIndex: 9999,
        background: good ? '#0f0' : '#f33',
        color: '#000',
        border: '2px solid #000',
        borderRadius: 10,
        padding: '6px 10px',
        fontSize: 12,
        maxWidth: 420
      }}
      aria-live="polite"
      title={`Backend: ${backendBase}`}
    >
      <strong>Backend:</strong> {good ? 'Healthy' : 'Unavailable'}
      <span style={{ marginLeft: 6, opacity: 0.8 }}>@ {backendBase}</span>
      <div
        style={{
          marginTop: 4,
          fontFamily: 'monospace',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}
      >
        {status.msg}
      </div>
    </div>
  )
}
