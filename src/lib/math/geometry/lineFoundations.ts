export const LINE_FOUNDATIONS_LESSON_SEEDS = {
  objects: 410401,
  segmentRelations: 410402,
  pointDistance: 410403,
  parallelDistance: 410404,
} as const;

export type LineFoundationsActivity = keyof typeof LINE_FOUNDATIONS_LESSON_SEEDS;

const ACTIVITY_BY_SEED = new Map<number, LineFoundationsActivity>(
  Object.entries(LINE_FOUNDATIONS_LESSON_SEEDS).map(([activity, seed]) => [seed, activity as LineFoundationsActivity]),
);

export function isLineFoundationsLessonSeed(seed: number): boolean {
  return ACTIVITY_BY_SEED.has(seed);
}

export function getLineFoundationsActivity(seed: number): LineFoundationsActivity {
  return ACTIVITY_BY_SEED.get(seed) ?? "objects";
}
