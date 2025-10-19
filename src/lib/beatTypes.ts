export type BeatId = string;

export type BeatButton = {
  id: BeatId;
  label: string;
  color: string;
  firstSeenIn: string;
  unlockedAt: number;
};

export type BeatBoxNode = {
  id: string;
  type: BeatId;
  text: string;
  sealed: boolean;
  color: string;
  createdAt: number;
  sourceLesson?: string;
};

export function titleCase(id: string) {
  return id
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

export function hashColor(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h << 5) - h + id.charCodeAt(i);
  const hue = Math.abs(h) % 360;
  return `hsl(${hue} 70% 65%)`;
}
