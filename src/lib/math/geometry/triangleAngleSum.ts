import type { LessonDifficulty } from "@/types/lessonPackage";

export const TRIANGLE_ANGLE_SUM_GENERATOR_ID = "geometry-triangle-angle-sum-v1" as const;
export const TRIANGLE_ANGLE_SUM_LESSON_SEEDS = {
  explore: 480101,
  drag: 480102,
  missing: 480103,
  isosceles: 480104,
  independent: 480105,
} as const;

export interface TriangleAngleSumTask {
  generatorId: typeof TRIANGLE_ANGLE_SUM_GENERATOR_ID;
  generatorVersion: 1;
  seed: number;
  difficulty: LessonDifficulty;
  angles: readonly [number, number, number];
  missingIndex: 0 | 1 | 2;
  prompt: string;
}

const ANGLE_SETS: readonly (readonly [number, number, number])[] = [
  [55, 65, 60],
  [40, 70, 70],
  [90, 35, 55],
  [72, 48, 60],
  [110, 30, 40],
];

export function isTriangleAngleSumLessonSeed(seed: number): boolean {
  return seed >= 480000 && seed < 481000;
}

export function createPublicTriangleAngleSumTask(seed: number, difficulty: LessonDifficulty = "core"): TriangleAngleSumTask {
  const index = Math.abs(Math.trunc(seed)) % ANGLE_SETS.length;
  const angles = ANGLE_SETS[index]!;
  const missingIndex = (Math.abs(Math.trunc(seed / 7)) % 3) as 0 | 1 | 2;
  return {
    generatorId: TRIANGLE_ANGLE_SUM_GENERATOR_ID,
    generatorVersion: 1,
    seed,
    difficulty,
    angles,
    missingIndex,
    prompt: `Oblicz kąt ${"ABC"[missingIndex]} tak, aby suma kątów trójkąta wynosiła 180°.`
  };
}

export function triangleAngleSumValue(angles: readonly [number, number, number]): number {
  return angles[0] + angles[1] + angles[2];
}
