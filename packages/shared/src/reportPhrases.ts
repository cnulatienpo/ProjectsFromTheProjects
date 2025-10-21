export const HEADLINES = [
  "Your lines walk with purpose.",
  "Your pages breathe—clean beats, clear stakes.",
  "Voice carries; the cuts land."
];

export const VERDICTS = [
  "You choose clarity without sanding off your voice.",
  "Your scenes move—action pairs with reveal instead of monologue.",
  "You signal theme in small acts, not lectures."
];

export const DRILLS = {
  beats:["Write a Red-Blue-Purple trio: [ACTION] → [REVEAL] → body logic.","Turn a label into behavior once per paragraph."],
  grammar:["Fix one comma splice; justify any semicolon.","Cut one hedge word per sentence (really, very, just)."],
  style:["Swap 3 weak verbs for vivid ones.","Replace one abstract noun with a concrete detail."]
};

export function pickNonRepeating<T>(arr: T[], used: Set<number>, n: number){
  const out:T[] = [];
  for (let i=0;i<arr.length && out.length<n;i++){
    if (!used.has(i)){ used.add(i); out.push(arr[i]); }
  }
  // If we ran out, reset
  if (out.length < n){
    used.clear();
    return arr.slice(0, n);
  }
  return out;
}
