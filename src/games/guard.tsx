import React, { useEffect, useState } from "react";

type Flags = { gameEnabled?: boolean; maintenanceMessage?: string };

async function fetchFlags(): Promise<Flags> {
  try {
    const r = await fetch("/api/flags", { cache: "no-store" });
    const j = await r.json();
    return (j?.flags ?? j) as Flags;
  } catch {
    return { gameEnabled: true, maintenanceMessage: "" };
  }
}

export function useFlags(pollMs = 0) {
  const [flags, setFlags] = useState<Flags>({ gameEnabled: true, maintenanceMessage: "" });
  useEffect(() => {
    let timer: any;
    (async () => setFlags(await fetchFlags()))();
    if (pollMs > 0) {
      timer = setInterval(async () => setFlags(await fetchFlags()), pollMs);
    }
    return () => clearInterval(timer);
  }, [pollMs]);
  return flags;
}

export function Guard(props: { gameId: string; children: React.ReactNode }) {
  const { gameId, children } = props;
  const { gameEnabled = true, maintenanceMessage = "" } = useFlags(0);
  if (!gameEnabled) {
    return (
      <div style={{ padding: 20, fontFamily: "system-ui, sans-serif", lineHeight: 1.4 }}>
        <h1>Temporarily Unavailable</h1>
        <p style={{ opacity: 0.8 }}>
          The game <strong>{gameId}</strong> is currently under maintenance.
        </p>
        {maintenanceMessage ? <p>{maintenanceMessage}</p> : null}
      </div>
    );
  }
  return <>{children}</>;
}
