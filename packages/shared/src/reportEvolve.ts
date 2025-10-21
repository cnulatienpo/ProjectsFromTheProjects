export function memoToneForLevel(level:number){
  if (level <= 1) return { sentences: 6, warmth: 0.7, edge: 0.2, includeDislikes: false };
  if (level <= 3) return { sentences: 8, warmth: 0.6, edge: 0.3, includeDislikes: true };
  return { sentences: 10, warmth: 0.5, edge: 0.4, includeDislikes: true };
}

export function dislikeMix(level:number){
  if (level <= 1) return ["beigeProse"];
  if (level <= 3) return ["beigeProse","metaphorSalad"];
  return ["beigeProse","metaphorSalad","soapboxPreach","ampersandAbuser"];
}
