export async function maybeBuildStyleReport(userId: string, leveledUp: boolean) {
  if (!leveledUp) return null;
  // TODO: build Professor Ray Ray memo from recent attempts; save to reports table
  return { title: "Professor Ray Ray memo", body: "…generated memo…" };
}
