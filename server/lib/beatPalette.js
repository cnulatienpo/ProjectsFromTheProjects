export const BEATS = [
    // 🔴 Red – Story Movement
    { key: "action", label: "Action", color: "#ef4444", family: "Red" },
    { key: "decision", label: "Decision", color: "#dc2626", family: "Red" },
    { key: "desire", label: "Desire", color: "#b91c1c", family: "Red" },
    { key: "conflict", label: "Conflict", color: "#991b1b", family: "Red" },
    { key: "obstacle", label: "Obstacle", color: "#7f1d1d", family: "Red" },
    { key: "climax", label: "Climax", color: "#991b1b", family: "Red" },
    { key: "resolution", label: "Resolution", color: "#f87171", family: "Red" },

    // 🔵 Blue – Info & Change
    { key: "reveal", label: "Reveal", color: "#2563eb", family: "Blue" },
    { key: "realization", label: "Realization", color: "#1d4ed8", family: "Blue" },
    { key: "exposition", label: "Exposition", color: "#3b82f6", family: "Blue" },
    { key: "foreshadow", label: "Foreshadow", color: "#60a5fa", family: "Blue" },
    { key: "setup", label: "Setup", color: "#93c5fd", family: "Blue" },
    { key: "payoff", label: "Payoff", color: "#1e40af", family: "Blue" },

    // 🟣 Purple – Emotion/Psych
    { key: "emotion", label: "Emotion", color: "#a855f7", family: "Purple" },
    { key: "suppression", label: "Suppression", color: "#7e22ce", family: "Purple" },
    { key: "vulnerability", label: "Vulnerability", color: "#6d28d9", family: "Purple" },
    { key: "power", label: "Power", color: "#5b21b6", family: "Purple" },
    { key: "shift", label: "Shift", color: "#8b5cf6", family: "Purple" },
    { key: "intimacy", label: "Intimacy", color: "#c084fc", family: "Purple" },
    { key: "alienation", label: "Alienation", color: "#d8b4fe", family: "Purple" },

    // 🟢 Green – Interaction/Relationships
    { key: "dialogue", label: "Dialogue", color: "#16a34a", family: "Green" },
    { key: "nonverbal", label: "Nonverbal", color: "#22c55e", family: "Green" },
    { key: "interaction", label: "Interaction", color: "#059669", family: "Green" },
    { key: "agreement", label: "Agreement", color: "#10b981", family: "Green" },
    { key: "disagreement", label: "Disagreement", color: "#047857", family: "Green" },
    { key: "test", label: "Test", color: "#065f46", family: "Green" },
    { key: "reversal", label: "Reversal", color: "#34d399", family: "Green" },

    // 🟠 Orange – World/Environment
    { key: "atmosphere", label: "Atmosphere", color: "#f59e0b", family: "Orange" },
    { key: "discovery", label: "Discovery", color: "#fb923c", family: "Orange" },
    { key: "loss", label: "Loss", color: "#ea580c", family: "Orange" },
    { key: "arrival", label: "Arrival", color: "#f97316", family: "Orange" },
    { key: "departure", label: "Departure", color: "#c2410c", family: "Orange" },
    { key: "transition", label: "Transition", color: "#fdba74", family: "Orange" },

    // ⚪ Gray – Structure/Meta
    { key: "inciting", label: "Inciting", color: "#6b7280", family: "Gray" },
    { key: "turning point", label: "Turning Point", color: "#4b5563", family: "Gray" },
    { key: "mirror", label: "Mirror", color: "#9ca3af", family: "Gray" },
    { key: "bridge", label: "Bridge", color: "#374151", family: "Gray" },
    { key: "suspense", label: "Suspense", color: "#111827", family: "Gray" },
    { key: "release", label: "Release", color: "#d1d5db", family: "Gray" },

    // 🟡 Gold – Thematic
    { key: "thematic statement", label: "Theme Statement", color: "#eab308", family: "Gold" },
    { key: "counterpoint", label: "Counterpoint", color: "#ca8a04", family: "Gold" },
    { key: "test of belief", label: "Test of Belief", color: "#facc15", family: "Gold" },
    { key: "transformation", label: "Transformation", color: "#fde047", family: "Gold" },
    { key: "thematic mirror", label: "Thematic Mirror", color: "#a16207", family: "Gold" },
    { key: "sacrifice", label: "Sacrifice", color: "#854d0e", family: "Gold" },
    { key: "thematic revelation", label: "Thematic Revelation", color: "#eab308", family: "Gold" },
    { key: "thematic resolution", label: "Thematic Resolution", color: "#f59e0b", family: "Gold" },
];

export const BEAT_FAMILY = Object.fromEntries(BEATS.map(b => [b.key, b.family]));
