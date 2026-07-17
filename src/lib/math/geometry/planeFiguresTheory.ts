export type PlaneFiguresTheoryActivity =
  | "angle-range"
  | "parallel-angle-pairs"
  | "rectangle-square"
  | "parallelogram-rhombus"
  | "trapezoid"
  | "quadrilateral-family"
  | "symmetry"
  | "review";

export type PlaneFiguresTheoryDifficulty = "theory" | "practice" | "challenge";

export const PLANE_FIGURES_THEORY_GENERATOR_ID = "geometry-plane-figures-theory-v1";

export const PLANE_FIGURES_THEORY_SEEDS = {
  "angle-range": { theory: 490001, practice: 490002, challenge: 490003 },
  "parallel-angle-pairs": { theory: 490051, practice: 490052, challenge: 490053 },
  "rectangle-square": { theory: 490101, practice: 490102, challenge: 490103 },
  "parallelogram-rhombus": { theory: 490201, practice: 490202, challenge: 490203 },
  trapezoid: { theory: 490301, practice: 490302, challenge: 490303 },
  "quadrilateral-family": { theory: 490401, practice: 490402, challenge: 490403 },
  symmetry: { theory: 490501, practice: 490502, challenge: 490503 },
  review: { theory: 490601, practice: 490602, challenge: 490603 },
} as const satisfies Record<PlaneFiguresTheoryActivity, Record<PlaneFiguresTheoryDifficulty, number>>;

export const PLANE_FIGURES_REVIEW_SEEDS = [490610, 490611, 490612, 490613, 490614, 490615, 490616, 490617, 490618, 490619] as const;

const SEED_ENTRIES = Object.entries(PLANE_FIGURES_THEORY_SEEDS).flatMap(([activity, levels]) => (
  Object.entries(levels).map(([difficulty, seed]) => ({
    activity: activity as PlaneFiguresTheoryActivity,
    difficulty: difficulty as PlaneFiguresTheoryDifficulty,
    seed,
  }))
));

export function isPlaneFiguresTheorySeed(seed: number): boolean {
  return SEED_ENTRIES.some((entry) => entry.seed === seed) || PLANE_FIGURES_REVIEW_SEEDS.includes(seed as typeof PLANE_FIGURES_REVIEW_SEEDS[number]);
}

export function decodePlaneFiguresTheorySeed(seed: number): { activity: PlaneFiguresTheoryActivity; difficulty: PlaneFiguresTheoryDifficulty } {
  if (PLANE_FIGURES_REVIEW_SEEDS.includes(seed as typeof PLANE_FIGURES_REVIEW_SEEDS[number])) return { activity: "review", difficulty: "challenge" };
  const match = SEED_ENTRIES.find((entry) => entry.seed === seed) ?? SEED_ENTRIES[0]!;
  return { activity: match.activity, difficulty: match.difficulty };
}
