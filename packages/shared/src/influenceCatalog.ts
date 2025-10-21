export const INFLUENCES = [
  { key:"hemingway",       label:"Ernest Hemingway" },
  { key:"morrison",        label:"Toni Morrison" },
  { key:"didion",          label:"Joan Didion" },
  { key:"chandler",        label:"Raymond Chandler" },
  { key:"garciamarquez",   label:"Gabriel García Márquez" },
  { key:"saunders",        label:"George Saunders" },
  { key:"baldwin",         label:"James Baldwin" },
  // “dislike” neighbors (anti-styles)
  { key:"purpleProse",     label:"Purple Prose" },
  { key:"edgeLord",        label:"Edgelord Maximalism" },
  { key:"tedTalk",         label:"TED-Talk Lecture Mode" },
  { key:"ampersandAbuser", label:"Ampersand Abuser" },
  { key:"metaphorSalad",   label:"Metaphor Salad" },
  { key:"soapboxPreach",   label:"Soapbox Preach" },
  { key:"beigeProse",      label:"Beige Prose" },
];

export type FeatureVector = Record<string, number>; // cadence, verbs, hedges, etc.

export function nearestNeighbors(vec: FeatureVector, k = 5){
  // Placeholder distance on overlapping keys; replace with real vectors when available
  const score = (key:string) => {
    // basic tie-in until we store real vectors
    return Math.random();
  };
  return INFLUENCES
    .map(n => ({ key:n.key, label:n.label, weight: score(n.key) }))
    .sort((a,b)=> b.weight - a.weight)
    .slice(0,k);
}
