export type Extracted = {
  cadence:number;           // 0..1 short→long bias
  verbVivid:number;         // 0..1 vividness
  hedges:number;            // per 100 words
  setupPayoff:number;       // 0..1 ratio seen
  worldRatio:number;        // Orange beats proportion
  bodyLogicRatio:number;    // nonverbal/body logic density
  escalation:number;        // 0..1
};

export function extractFeatures(text:string): Extracted {
  const words = (text.match(/\b\w+\b/g) || []).length || 1;
  const hedges = (text.match(/\b(really|very|just|kind of|sort of)\b/gi) || []).length;
  const cadence = Math.min(1, (text.split(/[.!?]/).reduce((a,s)=>a+(s.trim().length>80?1:0),0)) / 10);
  return {
    cadence,
    verbVivid: 0.5,
    hedges: (100*hedges)/words,
    setupPayoff: 0.3,
    worldRatio: 0.3,
    bodyLogicRatio: 0.2,
    escalation: 0.4
  };
}
