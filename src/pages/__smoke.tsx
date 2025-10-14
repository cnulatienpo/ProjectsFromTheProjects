import React, { Suspense, useEffect, useMemo, useState } from "react";
import { resolveOriginalScreens, loadComponent } from "../games/original.resolve";

type ScreenKey = "home" | "play" | "rules";

type ProbeResult = {
  route: string;
  result: string;
};

export default function Smoke() {
  const screens = useMemo(() => resolveOriginalScreens(), []);
  const [chosen, setChosen] = useState<string | null>(null);
  const [Comp, setComp] = useState<React.ComponentType<any> | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const [probes, setProbes] = useState<ProbeResult[]>([]);

  useEffect(() => {
    let cancelled = false;
    const order: ScreenKey[] = ["home", "play", "rules"];
    const routeLabels: Record<ScreenKey, string> = {
      home: "#/sigil-syntax",
      play: "#/sigil-syntax/play",
      rules: "#/sigil-syntax/rules",
    };

    async function run() {
      const results: ProbeResult[] = [];
      for (const which of order) {
        const path = (screens as Record<string, string | null | undefined>)[which];
        if (!path) continue;
        try {
          await loadComponent(path);
          results.push({ route: routeLabels[which], result: "loaded ok" });
        } catch (error) {
          const err = error as { message?: string; stack?: string } | undefined;
          const message = err?.message ?? String(error);
          const stack = typeof err?.stack === "string" ? err.stack.split("\n").slice(0, 2).join("\n") : "";
          const detail = stack ? `${message}\n${stack}` : message;
          results.push({ route: routeLabels[which], result: detail });
        }
      }
      if (!cancelled) {
        setProbes(results);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [screens]);

  async function tryLoad(which: ScreenKey) {
    const path = (screens as any)[which];
    if (!path) {
      setLog((x) => [`no ${which} candidate`, ...x]);
      return;
    }
    try {
      const C = await loadComponent(path);
      setComp(() => C);
      setChosen(path);
      setLog((x) => [`ok: ${which} ← ${path}`, ...x]);
    } catch (e: any) {
      setComp(null);
      setChosen(null);
      const message = e?.message ?? String(e);
      setLog((x) => [`ERR ${which}: ${message}`, ...x]);
    }
  }

  return (
    <div style={{ padding: 20, fontFamily: "system-ui, sans-serif", lineHeight: 1.4 }}>
      <h1>ORIGINAL Smoke</h1>
      <p>
        home: <code>{screens.home || "(none)"}</code>
      </p>
      <p>
        play: <code>{screens.play || "(none)"}</code>
      </p>
      <p>
        rules: <code>{screens.rules || "(none)"}</code>
      </p>
      <p>
        <button onClick={() => tryLoad("home")}>Load Home</button>{" "}
        <button onClick={() => tryLoad("play")}>Load Play</button>{" "}
        <button onClick={() => tryLoad("rules")}>Load Rules</button>
      </p>
      <p>
        Routes: <a href="#/sigil-syntax">#/sigil-syntax</a> · <a href="#/sigil-syntax/play">#/sigil-syntax/play</a> · <a href="#/sigil-syntax/rules">#/sigil-syntax/rules</a>
      </p>
      <hr />
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 16 }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", padding: "4px 8px", borderBottom: "1px solid #ddd" }}>route</th>
            <th style={{ textAlign: "left", padding: "4px 8px", borderBottom: "1px solid #ddd" }}>result</th>
          </tr>
        </thead>
        <tbody>
          {probes.length === 0 ? (
            <tr>
              <td colSpan={2} style={{ padding: "8px" }}>
                <em>waiting…</em>
              </td>
            </tr>
          ) : (
            probes.map((probe) => (
              <tr key={probe.route}>
                <td style={{ verticalAlign: "top", padding: "4px 8px", borderBottom: "1px solid #f0f0f0" }}>
                  <code>{probe.route}</code>
                </td>
                <td style={{ verticalAlign: "top", padding: "4px 8px", borderBottom: "1px solid #f0f0f0" }}>
                  <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{probe.result}</pre>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <div style={{ margin: "12px 0", opacity: 0.7 }}>
        loaded: <code>{chosen || "(none)"}</code>
      </div>
      {Comp ? (
        <Suspense fallback={<div>Loading…</div>}>
          <Comp />
        </Suspense>
      ) : (
        <em>nothing loaded</em>
      )}
      <hr />
      <pre style={{ background: "#f7f7f7", padding: 12, overflow: "auto", maxHeight: 240 }}>{log.join("\n")}</pre>
    </div>
  );
}
