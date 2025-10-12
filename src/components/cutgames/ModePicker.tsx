import { useEffect, useState } from "react";
import { fetchCatalog } from "../../lib/cutGamesClient";

type Mode = { name: string; desc?: string };

type ModePickerProps = {
  value?: string;
  onChange: (mode: string) => void;
};

const FALLBACK_MODES: Mode[] = [
  { name: "Name", desc: "Identify beats by name" },
  { name: "Missing", desc: "Find what's missing" },
  { name: "Fix", desc: "Repair weak writing" },
  { name: "Order", desc: "Arrange beats in sequence" },
  { name: "Highlight", desc: "Mark beats in context" },
  { name: "Why", desc: "Explain the purpose" },
];

export default function ModePicker({ value, onChange }: ModePickerProps) {
  const [modes, setModes] = useState<Mode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const catalog = await fetchCatalog();
        if (!active) return;
        const catalogModes: Mode[] = (catalog?.modes ?? []).map((mode: any) => ({
          name: String(mode?.name ?? ""),
          desc: mode?.desc,
        }));
        const filtered = catalogModes.filter((mode) => mode.name);
        setModes(filtered.length ? filtered : FALLBACK_MODES);
      } catch {
        if (!active) return;
        setModes(FALLBACK_MODES);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const selected = value || modes[0]?.name;

  return (
    <div className="card" data-testid="mode-picker">
      <h2 className="mb-3">Choose a mode</h2>
      {loading ? (
        <div className="pulse">loading modes…</div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {modes.map((mode) => (
            <button
              key={mode.name}
              className={`btn btn-ghost justify-start ${selected === mode.name ? "border-white" : ""}`}
              onClick={() => onChange(mode.name)}
              title={mode.desc || ""}
              data-testid={`mode-option-${mode.name.replace(/\s+/g, "-").toLowerCase()}`}
            >
              <span className="mr-2 font-semibold">{mode.name}</span>
              <span className="text-neutral-400">{mode.desc}</span>
            </button>
          ))}
        </div>
      )}
      <div className="mt-3 flex items-center gap-2 text-xs text-neutral-400">
        <span className="kbd">R</span>
        <span>start round</span>
      </div>
    </div>
  );
}
