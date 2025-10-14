// For quick diagnostics & optional usage by the game.
// You can import this into your generic app if needed.
export const labeledDataRaw = import.meta.glob(
  "/labled data/**/*.{json,jsonl,txt,md}",
  { as: "raw", eager: true }
) as Record<string, string>;

export const labeledDataJson = import.meta.glob(
  "/labled data/**/*.json",
  { eager: true }
) as Record<string, any>;
