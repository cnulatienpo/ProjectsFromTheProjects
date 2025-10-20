<<<<<<< HEAD
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
=======
import React from "react";

export function DebugOverlay({ note }: { note?: string }) {
    const s: React.CSSProperties = {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 99999,
        background: "linear-gradient(90deg,#000,#333)",
        color: "#0f0",
        font: "12px/1.4 monospace",
        padding: "6px 10px",
        opacity: 0.9,
        pointerEvents: "none",
    };
    const u = (typeof window !== "undefined" && window.location && window.location.href) || "";
    return (
        <div style={s}>
            <span>DEBUG</span>
            <span style={{ marginLeft: 10 }}>url: {u}</span>
            <span style={{ marginLeft: 10 }}>time: {new Date().toLocaleTimeString()}</span>
            {note ? <span style={{ marginLeft: 10 }}>note: {note}</span> : null}
        </div>
    );
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { err?: any }> {
    state: { err?: any } = { err: undefined };

    static getDerivedStateFromError(err: any) {
        return { err };
    }

    componentDidCatch(err: any, info: any) {
        console.error("[EB] caught", err, info);
    }

    render() {
        if (this.state.err) {
            return (
                <div style={{ padding: 16, fontFamily: "monospace" }}>
                    <h3>💥 UI crashed</h3>
                    <pre style={{ whiteSpace: "pre-wrap" }}>{String(this.state.err?.stack || this.state.err)}</pre>
                </div>
            );
        }
        return this.props.children;
    }
>>>>>>> 31cda24e3a6d97fb3053b714bfc2f4d4c2b8c112
}
