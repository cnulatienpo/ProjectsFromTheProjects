import React from 'react'
export function DebugOverlay({ note }: { note?: string }) {
    const s: React.CSSProperties = { position: 'fixed', top: 0, left: 0, right: 0, zIndex: 99999, background: 'rgba(0,0,0,0.8)', color: '#0f0', font: '12px/1.4 monospace', padding: '6px 10px', pointerEvents: 'none' }
    return <div style={s}>DEBUG · {new Date().toLocaleTimeString()} {note ? `· ${note}` : ''}</div>
}
export class ErrorBoundary extends React.Component<{ children: any }, { err?: any }> {
    state = { err: undefined as any }
    static getDerivedStateFromError(err: any) { return { err } }
    componentDidCatch(err: any, info: any) { console.error('[EB] caught', err, info) }
    render() { if (this.state.err) return <div style={{ padding: 16, fontFamily: 'monospace' }}><h3>💥 UI crashed</h3><pre>{String(this.state.err?.stack || this.state.err)}</pre></div>; return this.props.children }
}
