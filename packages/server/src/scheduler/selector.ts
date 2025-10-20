export default async function pickNext(userId: string){
  // TODO: bias to weak skills, freshness, and tweetrunk introduces_beats gates
  // Return shape the web app expects: { itemId, mode, passage, options? … }
  return { itemId: "demo-1", mode: "rewrite", passage: "Write a short scene…" };
}
