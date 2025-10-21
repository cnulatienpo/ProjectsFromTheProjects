type NextItem = { itemId: string; mode: string; passage?: string; options?: any };

export default async function pickNext(userId: string): Promise<NextItem> {
  // TODO: bias by low mastery + freshness + introduces_beats unlocks
  return {
    itemId: "demo-1",
    mode: "rewrite",
    passage: "Write a tiny scene with [ACTION] and [REVEAL].",
  };
}
