import { createDefaultGeometryState } from "@/lib/math/geometry/geometryState";
import type { LessonDifficulty } from "@/types/lessonPackage";
import type { GeometryLabMode, GeometryLabState } from "@/types/geometry";

export const TRIANGLE_CONSTRUCTION_GENERATOR_ID = "geometry-triangle-construction-v1" as const;

export type TriangleConstructionActivity =
  | "close-segments"
  | "inequality"
  | "circles"
  | "construction-steps"
  | "bridge"
  | "independent";

export const TRIANGLE_CONSTRUCTION_LESSON_SEEDS = {
  "close-segments": { support: 470101, core: 470102, challenge: 470103 },
  inequality: { support: 470201, core: 470202, challenge: 470203 },
  circles: { support: 470301, core: 470302, challenge: 470303 },
  "construction-steps": { support: 470401, core: 470402, challenge: 470403 },
  bridge: { support: 470501, core: 470502, challenge: 470503 },
  independent: { support: 470601, core: 470602, challenge: 470603 },
} as const satisfies Record<TriangleConstructionActivity, Record<LessonDifficulty, number>>;

const ACTIVITY_FROM_FAMILY: Record<number, TriangleConstructionActivity> = {
  1: "close-segments",
  2: "inequality",
  3: "circles",
  4: "construction-steps",
  5: "bridge",
  6: "independent",
};

const DIFFICULTY_FROM_SUFFIX: Record<number, LessonDifficulty> = { 1: "support", 2: "core", 3: "challenge" };

const SIDE_SETS: Record<TriangleConstructionActivity, Record<LessonDifficulty, readonly [number, number, number]>> = {
  "close-segments": { support: [3, 4, 5], core: [4, 6, 7], challenge: [2, 3, 6] },
  inequality: { support: [3, 3, 5], core: [4, 5, 8], challenge: [4, 5, 9] },
  circles: { support: [3, 4, 5], core: [5, 5, 7], challenge: [3, 5, 7] },
  "construction-steps": { support: [4, 4, 6], core: [4, 6, 7], challenge: [5, 6, 8] },
  bridge: { support: [3, 4, 5], core: [5, 5, 8], challenge: [3, 4, 8] },
  independent: { support: [4, 5, 6], core: [5, 6, 8], challenge: [3, 5, 9] },
};

export interface TriangleSideAnalysis {
  original: readonly [number, number, number];
  sorted: readonly [number, number, number];
  possible: boolean;
  relation: "greater" | "equal" | "less";
  shortSum: number;
  longest: number;
  closureDifference: number;
  intersectionCount: 0 | 1 | 2;
}

export interface TriangleConstructionPublicTask {
  generatorId: typeof TRIANGLE_CONSTRUCTION_GENERATOR_ID;
  generatorVersion: 1;
  seed: number;
  difficulty: LessonDifficulty;
  activity: TriangleConstructionActivity;
  sideLengths: readonly [number, number, number];
  prompt: string;
  skillIds: readonly ["M5-4.7-triangle-feasibility", "M5-4.7-compass-construction", "M5-4.7-construction-explanation"];
  invariants: readonly string[];
}

export function analyzeTriangleSideLengths(input: readonly [number, number, number]): TriangleSideAnalysis {
  if (input.some((value) => !Number.isFinite(value) || value <= 0)) {
    throw new Error("Długości boków muszą być dodatnimi liczbami.");
  }
  const sorted = [...input].sort((a, b) => a - b) as [number, number, number];
  const shortSum = sorted[0] + sorted[1];
  const longest = sorted[2];
  const relation = shortSum > longest ? "greater" : shortSum === longest ? "equal" : "less";
  return {
    original: input,
    sorted,
    possible: relation === "greater",
    relation,
    shortSum,
    longest,
    closureDifference: Math.abs(shortSum - longest),
    intersectionCount: relation === "greater" ? 2 : relation === "equal" ? 1 : 0,
  };
}

export function isTriangleConstructionLessonSeed(seed: number): boolean {
  if (!Number.isSafeInteger(seed) || seed < 470101 || seed > 470603) return false;
  const family = Math.floor((seed - 470000) / 100);
  return Boolean(ACTIVITY_FROM_FAMILY[family] && DIFFICULTY_FROM_SUFFIX[seed % 100]);
}

export function getTriangleConstructionSeedConfig(seed: number): Pick<TriangleConstructionPublicTask, "seed" | "difficulty" | "activity"> {
  if (!isTriangleConstructionLessonSeed(seed)) throw new Error(`Seed ${seed} nie należy do pakietu M5-4.7.`);
  return {
    seed,
    difficulty: DIFFICULTY_FROM_SUFFIX[seed % 100]!,
    activity: ACTIVITY_FROM_FAMILY[Math.floor((seed - 470000) / 100)]!,
  };
}

function promptFor(activity: TriangleConstructionActivity, sides: readonly [number, number, number]): string {
  const values = sides.join(" cm, ");
  switch (activity) {
    case "close-segments": return `Ułóż odcinki ${values} cm końcami do siebie. Sprawdź na rysunku, czy powstaje zamknięty trójkąt.`;
    case "inequality": return `Porównaj dwa krótsze odcinki z najdłuższym dla boków ${values} cm. Najpierw użyj modelu, potem zapisz nierówność.`;
    case "circles": return `Dla boków ${values} cm narysuj podstawę i dwa okręgi. Ich przecięcia wyznaczą możliwe położenia trzeciego wierzchołka.`;
    case "construction-steps": return `Wykonaj konstrukcję boków ${values} cm po kolei: podstawa, pierwszy łuk, drugi łuk, punkt przecięcia i boki.`;
    case "bridge": return `Most ma trzy cięgna długości ${values} m. Zdecyduj, czy utworzą sztywną trójkątną ramę, i pokaż dowód.`;
    case "independent": return `Samodzielnie rozstrzygnij możliwość konstrukcji dla ${values} cm. Jeśli można, wykonaj konstrukcję; jeśli nie, pokaż brak domknięcia.`;
  }
}

export function createPublicTriangleConstructionTask(seed: number): TriangleConstructionPublicTask {
  const config = getTriangleConstructionSeedConfig(seed);
  const sideLengths = SIDE_SETS[config.activity][config.difficulty];
  return {
    generatorId: TRIANGLE_CONSTRUCTION_GENERATOR_ID,
    generatorVersion: 1,
    ...config,
    sideLengths,
    prompt: promptFor(config.activity, sideLengths),
    skillIds: ["M5-4.7-triangle-feasibility", "M5-4.7-compass-construction", "M5-4.7-construction-explanation"],
    invariants: [
      "feasibility-from-current-side-lengths",
      "two-shorter-sides-compared-with-longest",
      "circle-intersections-determine-third-vertex",
      "equal-short-sum-is-degenerate-not-triangle",
      "answer-spec-server-only",
    ],
  };
}

export function triangleConstructionSeedFor(activity: TriangleConstructionActivity, difficulty: LessonDifficulty): number {
  return TRIANGLE_CONSTRUCTION_LESSON_SEEDS[activity][difficulty];
}

export function triangleVertexFromSides(
  sideLengths: readonly [number, number, number],
  scale = 40,
  origin = { x: 100, y: 320 },
): { a: { x: number; y: number }; b: { x: number; y: number }; upper: { x: number; y: number } | null; lower: { x: number; y: number } | null } {
  const [ab, bc, ca] = sideLengths;
  const analysis = analyzeTriangleSideLengths(sideLengths);
  const a = { ...origin };
  const b = { x: origin.x + ab * scale, y: origin.y };
  if (!analysis.possible || ab <= 0) return { a, b, upper: null, lower: null };
  const x = (ca * ca + ab * ab - bc * bc) / (2 * ab);
  const heightSquared = Math.max(0, ca * ca - x * x);
  const height = Math.sqrt(heightSquared);
  return {
    a,
    b,
    upper: { x: origin.x + x * scale, y: origin.y - height * scale },
    lower: { x: origin.x + x * scale, y: origin.y + height * scale },
  };
}

export function createTriangleConstructionGeometryState(
  seed: number,
  mode: GeometryLabMode = "practice",
  overrideSides?: readonly [number, number, number],
): GeometryLabState {
  const task = createPublicTriangleConstructionTask(seed);
  const sides = overrideSides ?? task.sideLengths;
  const base = createDefaultGeometryState({ seed, mode, vertexCount: 3 });
  const fitScale = Math.min(48, 400 / Math.max(...sides));
  const vertices = triangleVertexFromSides(sides, fitScale, { x: 110, y: 330 });
  const coordinates = [vertices.a, vertices.b, vertices.upper ?? { x: 110 + sides[2] * fitScale, y: 330 }];
  return {
    ...base,
    viewport: { width: 640, height: 430, padding: 30, scale: 1 },
    grid: { visible: true, step: 20, snap: false },
    points: base.points.map((point, index) => ({ ...point, ...(coordinates[index] ?? point), locked: true })),
    polygon: { ...base.polygon, closed: analyzeTriangleSideLengths(sides).possible, showSideLengths: true },
    selectedPointId: null,
  };
}
