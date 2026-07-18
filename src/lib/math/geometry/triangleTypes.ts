import { analyzeGeometryPolygon, pointById } from "@/lib/math/geometry/geometryMath";
import { createDefaultGeometryState } from "@/lib/math/geometry/geometryState";
import type { LessonDifficulty } from "@/types/lessonPackage";
import type { GeometryLabMode, GeometryLabState, GeometryPointCoordinates } from "@/types/geometry";

export const TRIANGLE_TYPES_GENERATOR_ID = "geometry-triangle-types-v1" as const;

export type TriangleTypesActivity =
  | "playground"
  | "side-names"
  | "right-side-names"
  | "identify-gallery"
  | "perimeter"
  | "predict"
  | "equal-sides"
  | "greatest-angle"
  | "possible-pair"
  | "tent"
  | "independent";

export type TriangleSideKind = "equilateral" | "isosceles" | "scalene";
export type TriangleAngleKind = "acute" | "right" | "obtuse";

export const TRIANGLE_SIDE_LABELS: Record<TriangleSideKind, string> = {
  equilateral: "równoboczny",
  isosceles: "równoramienny",
  scalene: "różnoboczny",
};

export const TRIANGLE_ANGLE_LABELS: Record<TriangleAngleKind, string> = {
  acute: "ostrokątny",
  right: "prostokątny",
  obtuse: "rozwartokątny",
};

export const TRIANGLE_SIDE_PRESET_LABELS: Record<TriangleSideKind, readonly [string, string, string]> = {
  equilateral: ["6 cm", "6 cm", "6 cm"],
  isosceles: ["6 cm", "5 cm", "5 cm"],
  scalene: ["4 cm", "5 cm", "3 cm"],
};

const TRIANGLE_SIDE_PRESET_POINTS: Record<TriangleSideKind, readonly [GeometryPointCoordinates, GeometryPointCoordinates, GeometryPointCoordinates]> = {
  equilateral: [
    { x: 160, y: 340 },
    { x: 480, y: 340 },
    { x: 320, y: 340 - 160 * Math.sqrt(3) },
  ],
  isosceles: [
    { x: 140, y: 340 },
    { x: 500, y: 340 },
    { x: 320, y: 100 },
  ],
  scalene: [
    { x: 160, y: 340 },
    { x: 480, y: 340 },
    { x: 160, y: 100 },
  ],
};

export const TRIANGLE_TYPES_LESSON_SEEDS = {
  playground: { support: 460101, core: 460102, challenge: 460103 },
  predict: { support: 460201, core: 460202, challenge: 460203 },
  "equal-sides": { support: 460301, core: 460302, challenge: 460303 },
  "greatest-angle": { support: 460401, core: 460402, challenge: 460403 },
  "possible-pair": { support: 460501, core: 460502, challenge: 460503 },
  tent: { support: 460601, core: 460602, challenge: 460603 },
  independent: { support: 460701, core: 460702, challenge: 460703 },
  "side-names": { support: 460801, core: 460802, challenge: 460803 },
  "right-side-names": { support: 460901, core: 460902, challenge: 460903 },
  "identify-gallery": { support: 461001, core: 461002, challenge: 461003 },
  perimeter: { support: 461101, core: 461102, challenge: 461103 },
} as const satisfies Record<TriangleTypesActivity, Record<LessonDifficulty, number>>;

const ACTIVITY_FROM_FAMILY: Record<number, TriangleTypesActivity> = {
  1: "playground",
  2: "predict",
  3: "equal-sides",
  4: "greatest-angle",
  5: "possible-pair",
  6: "tent",
  7: "independent",
  8: "side-names",
  9: "right-side-names",
  10: "identify-gallery",
  11: "perimeter",
};

const DIFFICULTY_FROM_SUFFIX: Record<number, LessonDifficulty> = { 1: "support", 2: "core", 3: "challenge" };

const POINT_SETS: Record<LessonDifficulty, readonly [GeometryPointCoordinates, GeometryPointCoordinates, GeometryPointCoordinates]> = {
  support: [{ x: 160, y: 340 }, { x: 480, y: 340 }, { x: 320, y: 100 }],
  core: [{ x: 120, y: 330 }, { x: 500, y: 330 }, { x: 260, y: 130 }],
  challenge: [{ x: 120, y: 300 }, { x: 520, y: 300 }, { x: 430, y: 120 }],
};

export interface TriangleTypesPublicTask {
  generatorId: typeof TRIANGLE_TYPES_GENERATOR_ID;
  generatorVersion: 1;
  seed: number;
  difficulty: LessonDifficulty;
  activity: TriangleTypesActivity;
  prompt: string;
  skillIds: readonly ["M5-4.6-triangle-sides", "M5-4.6-triangle-angles"];
  invariants: readonly string[];
}

export function isTriangleTypesLessonSeed(seed: number): boolean {
  if (!Number.isSafeInteger(seed) || seed < 460101 || seed > 461103) return false;
  const family = Math.floor((seed - 460000) / 100);
  return Boolean(ACTIVITY_FROM_FAMILY[family] && DIFFICULTY_FROM_SUFFIX[seed % 100]);
}

export function getTriangleTypesSeedConfig(seed: number): Pick<TriangleTypesPublicTask, "seed" | "difficulty" | "activity"> {
  if (!isTriangleTypesLessonSeed(seed)) throw new Error(`Seed ${seed} nie należy do pakietu M5-4.6.`);
  return {
    seed,
    difficulty: DIFFICULTY_FROM_SUFFIX[seed % 100]!,
    activity: ACTIVITY_FROM_FAMILY[Math.floor((seed - 460000) / 100)]!,
  };
}

function promptFor(activity: TriangleTypesActivity): string {
  switch (activity) {
    case "playground": return "Wybierz nazwę trójkąta. Obserwuj zmianę jego kształtu, długości boków i jednakowych oznaczeń.";
    case "side-names": return "Wskaż podstawę i dwa ramiona. Pamiętaj, że każdy bok można wybrać jako podstawę.";
    case "right-side-names": return "Rozpoznaj dwie przyprostokątne i przeciwprostokątną w trójkącie prostokątnym.";
    case "identify-gallery": return "Zaznacz trójkąty wskazanego rodzaju. Figury nie mają podanych miar ani nazw boków.";
    case "perimeter": return "Rozwiąż kolejno zadania o obwodzie trójkąta: oblicz obwód z boków albo brakujący bok z podanego obwodu.";
    case "predict": return "Najpierw wybierz klasyfikację według boków i kątów. Miary oraz poprawne nazwy odsłonią się po sprawdzeniu.";
    case "equal-sides": return "Odczytaj jednakowe kreski na bokach i wskaż dane, które dowodzą klasyfikacji według boków.";
    case "greatest-angle": return "Znajdź największy kąt. To jego miara rozstrzyga, czy trójkąt jest ostro-, prosto- czy rozwartokątny.";
    case "possible-pair": return "Zbuduj przykład podanej pary nazw albo wyjaśnij, dlaczego taka para nie może istnieć.";
    case "tent": return "Dopasuj dach namiotu do warunków konstrukcyjnych i uzasadnij wybór cechami, nie wyglądem.";
    case "independent": return "Sklasyfikuj trójkąt na dwa sposoby i wskaż boki oraz kąt stanowiące dowód.";
  }
}

export function createPublicTriangleTypesTask(seed: number): TriangleTypesPublicTask {
  const config = getTriangleTypesSeedConfig(seed);
  return {
    generatorId: TRIANGLE_TYPES_GENERATOR_ID,
    generatorVersion: 1,
    ...config,
    prompt: promptFor(config.activity),
    skillIds: ["M5-4.6-triangle-sides", "M5-4.6-triangle-angles"],
    invariants: [
      "classification-from-current-coordinates",
      "side-and-angle-classifications-are-independent",
      "rotation-and-reflection-preserve-classification",
      "degenerate-triangle-is-invalid",
      "answer-spec-server-only",
    ],
  };
}

export function triangleTypesSeedFor(activity: TriangleTypesActivity, difficulty: LessonDifficulty): number {
  return TRIANGLE_TYPES_LESSON_SEEDS[activity][difficulty];
}

export function createTriangleTypesGeometryState(seed: number, mode: GeometryLabMode = "practice"): GeometryLabState {
  const config = getTriangleTypesSeedConfig(seed);
  const base = createDefaultGeometryState({ seed, mode, vertexCount: 3 });
  const coordinates = POINT_SETS[config.difficulty];
  const ids = base.polygon.vertexIds;
  const points = base.points.map((point, index) => ({ ...point, ...(coordinates[index] ?? point) }));
  return {
    ...base,
    viewport: { width: 640, height: 420, padding: 30, scale: 1 },
    grid: { visible: true, step: 20, snap: true },
    points,
    angles: [
      { id: "angle-a", startPointId: ids[2]!, vertexPointId: ids[0]!, endPointId: ids[1]!, label: "∠A", showArc: true, showMeasure: true },
      { id: "angle-b", startPointId: ids[0]!, vertexPointId: ids[1]!, endPointId: ids[2]!, label: "∠B", showArc: true, showMeasure: true },
      { id: "angle-c", startPointId: ids[1]!, vertexPointId: ids[2]!, endPointId: ids[0]!, label: "∠C", showArc: true, showMeasure: true },
    ],
    selectedPointId: ids[2]!,
  };
}

export function applyTriangleSidePreset(state: GeometryLabState, kind: TriangleSideKind): GeometryLabState {
  const coordinates = TRIANGLE_SIDE_PRESET_POINTS[kind];
  const vertexIndexes = new Map(state.polygon.vertexIds.map((id, index) => [id, index]));
  return {
    ...state,
    grid: { ...state.grid, visible: false, snap: false },
    points: state.points.map((point) => {
      const index = vertexIndexes.get(point.id);
      return index === undefined ? point : { ...point, ...coordinates[index] };
    }),
    selectedPointId: null,
  };
}

export function triangleClassifications(state: GeometryLabState): { side: TriangleSideKind; angle: TriangleAngleKind } | null {
  const analysis = analyzeGeometryPolygon(state);
  if (analysis.status !== "valid" || analysis.vertexCount !== 3) return null;
  const sideText = analysis.classification[0] ?? "";
  const angleText = analysis.classification[1] ?? "";
  const side: TriangleSideKind = sideText.includes("równoboczny")
    ? "equilateral"
    : sideText.includes("równoramienny") ? "isosceles" : "scalene";
  const angle: TriangleAngleKind = angleText.includes("prostokątny")
    ? "right"
    : angleText.includes("rozwartokątny") ? "obtuse" : "acute";
  return { side, angle };
}

export function triangleClassificationEvidence(state: GeometryLabState): { equalSides: string[]; greatestAngle: string; greatestAngleDegrees: number } | null {
  const analysis = analyzeGeometryPolygon(state);
  if (analysis.status !== "valid" || analysis.vertexCount !== 3) return null;
  const labels = ["AB", "BC", "CA"];
  const equalSides = labels.filter((_, index) => analysis.sideLengths.some((length, candidate) => candidate !== index && length.squared === analysis.sideLengths[index]!.squared));
  const maximum = Math.max(...analysis.angleDegrees);
  const index = analysis.angleDegrees.indexOf(maximum);
  return { equalSides, greatestAngle: ["∠A", "∠B", "∠C"][index]!, greatestAngleDegrees: maximum };
}

export function triangleClassificationPairIsPossible(side: TriangleSideKind, angle: TriangleAngleKind): boolean {
  if (side === "equilateral") return angle === "acute";
  return true;
}

export function moveTriangleVertex(state: GeometryLabState, pointId: string, coordinates: GeometryPointCoordinates): GeometryLabState {
  const point = pointById(state.points, pointId);
  if (!point || point.locked || !Number.isFinite(coordinates.x) || !Number.isFinite(coordinates.y)) return state;
  const x = Math.max(state.viewport.padding, Math.min(state.viewport.width - state.viewport.padding, coordinates.x));
  const y = Math.max(state.viewport.padding, Math.min(state.viewport.height - state.viewport.padding, coordinates.y));
  const snapped = state.grid.snap
    ? { x: Math.round(x / state.grid.step) * state.grid.step, y: Math.round(y / state.grid.step) * state.grid.step }
    : { x, y };
  return { ...state, points: state.points.map((item) => item.id === pointId ? { ...item, ...snapped } : item) };
}
