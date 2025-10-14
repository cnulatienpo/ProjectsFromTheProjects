// Mulberry32 PRNG — small, fast, decent quality for UI randomness.
function mulberry32(seed: number) {
  let t = seed >>> 0;
  return function () {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(str: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function seedFromCrypto(): number {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return arr[0] || (Date.now() & 0xffffffff);
}

export type RNG = {
  seed: string; // human-readable
  random: () => number;
  randint: (minIncl: number, maxIncl: number) => number;
  pick: <T>(arr: T[]) => T;
  shuffle: <T>(arr: T[]) => T[];
};

export function createRNG(seedStr: string): RNG {
  const s = hashString(seedStr);
  const r = mulberry32(s);
  const api: RNG = {
    seed: seedStr,
    random: r,
    randint: (min, max) => {
      const a = Math.ceil(min);
      const b = Math.floor(max);
      return Math.floor(r() * (b - a + 1)) + a;
    },
    pick: (arr) => arr[Math.floor(r() * (arr.length || 1))],
    shuffle: (arr) => {
      const a = arr.slice();
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(r() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    },
  };
  return api;
}

// Session seed management — lives for the tab/session.
const KEY = "good-word:session-seed";

export function getSessionSeed(): string {
  const url = new URL(location.href);
  const override = url.searchParams.get("seed");
  if (override) {
    sessionStorage.setItem(KEY, override);
    return override;
  }
  const existing = sessionStorage.getItem(KEY);
  if (existing) return existing;
  const fresh = `gw-${seedFromCrypto().toString(16)}`;
  sessionStorage.setItem(KEY, fresh);
  return fresh;
}

// Singleton for convenience
let _rng: RNG | null = null;
export function rng(): RNG {
  if (_rng) return _rng;
  _rng = createRNG(getSessionSeed());
  return _rng;
}
