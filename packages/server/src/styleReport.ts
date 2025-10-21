export async function maybeBuildStyleReport(userId: string, leveledUp: boolean) {
  if (!leveledUp) return null;
  // TODO: build Professor Ray Ray memo from recent attempts and save to DB
  return { title: "Professor Ray Ray memo", body: "Report body here." };
}
