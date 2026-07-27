export const CIRCLE_LESSON_SEEDS = {
  circleAndDisk: 420201,
  elements: 420202,
  knowledgeQuiz: 420203,
  tangencyRule: 420204,
  tangencyTasks: 420205,
} as const;

export type CircleLessonActivity = keyof typeof CIRCLE_LESSON_SEEDS;

const ACTIVITY_BY_SEED = new Map<number, CircleLessonActivity>(
  Object.entries(CIRCLE_LESSON_SEEDS).map(([activity, seed]) => [seed, activity as CircleLessonActivity]),
);

export function isCircleLessonSeed(seed: number): boolean {
  return ACTIVITY_BY_SEED.has(seed);
}

export function getCircleLessonActivity(seed: number): CircleLessonActivity {
  return ACTIVITY_BY_SEED.get(seed) ?? "circleAndDisk";
}
