/** Deterministyczny RNG — bez Math.random w renderze (spec §26.1) */

export type SeededRng = () => number;

export function createSeededRng(seed: number): SeededRng {
  let state = seed >>> 0 || 1;

  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function pickInt(rng: SeededRng, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

export function pickOne<T>(rng: SeededRng, items: readonly T[]): T {
  return items[Math.floor(rng() * items.length)]!;
}
