export type Influence = { key:string; label:string; weight:number };

export type StyleReport = {
  userId: string;
  level: number;
  headline: string;
  verdict: string;
  strengths: string[];
  blindspots: string[];
  tendencies: string[];
  influences: Influence[];       // liked + disliked neighbors
  drills: string[];              // actionable next steps
  generatedAt: string;           // ISO
};
