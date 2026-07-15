import { pointById } from "@/lib/math/geometry/geometryMath";
import type { LessonDifficulty } from "@/types/lessonPackage";
import type { GeometryLabMode, GeometryLabState, GeometryPointCoordinates } from "@/types/geometry";

export const VERTICAL_ANGLES_GENERATOR_ID = "geometry-vertical-adjacent-l1-v1" as const;

export type VerticalAnglesActivity =
  | "crossing"
  | "pairs"
  | "one-angle"
  | "three-lines"
  | "roundabout"
  | "repair"
  | "independent";

export type IntersectionLineId = "a" | "b" | "c";
export type AnglePairRelation = "vertical" | "adjacent" | "neither";

export const VERTICAL_ANGLES_LESSON_SEEDS = {
  crossing: { support: 440101, core: 440102, challenge: 440103 },
  pairs: { support: 440201, core: 440202, challenge: 440203 },
  "one-angle": { support: 440301, core: 440302, challenge: 440303 },
  "three-lines": { support: 440401, core: 440402, challenge: 440403 },
  roundabout: { support: 440501, core: 440502, challenge: 440503 },
  repair: { support: 440601, core: 440602, challenge: 440603 },
  independent: { support: 440701, core: 440702, challenge: 440703 },
} as const satisfies Record<VerticalAnglesActivity, Record<LessonDifficulty, number>>;

export interface VerticalAnglesSeedConfig {
  seed: number;
  activity: VerticalAnglesActivity;
  difficulty: LessonDifficulty;
  baseDirectionDegrees: number;
  crossingAngleDegrees: number;
  thirdLineDirectionDegrees: number | null;
  givenAngleIndex: 0 | 1 | 2 | 3;
  vertex: GeometryPointCoordinates;
}

export interface VerticalAnglesPublicTask extends VerticalAnglesSeedConfig {
  generatorId: typeof VERTICAL_ANGLES_GENERATOR_ID;
  generatorVersion: 1;
  givenMeasureDegrees: number;
  prompt: string;
  skillIds: readonly ["M5-4.4-angle-pairs-properties", "M5-4.4-angle-calculations"];
  invariants: readonly string[];
}

export interface IntersectionSector {
  index: number;
  label: "α" | "β" | "γ" | "δ";
  startDirectionDegrees: number;
  endDirectionDegrees: number;
  bisectorDirectionDegrees: number;
  measureDegrees: number;
}

const ACTIVITIES: Record<number, VerticalAnglesActivity> = {
  1: "crossing",
  2: "pairs",
  3: "one-angle",
  4: "three-lines",
  5: "roundabout",
  6: "repair",
  7: "independent",
};

const DIFFICULTIES: Record<number, LessonDifficulty> = { 1: "support", 2: "core", 3: "challenge" };
const DIFFICULTY_INDEX: Record<LessonDifficulty, number> = { support: 0, core: 1, challenge: 2 };

const CROSSING_ANGLES: Record<VerticalAnglesActivity, readonly [number, number, number]> = {
  crossing: [42, 67, 118],
  pairs: [38, 57, 124],
  "one-angle": [35, 72, 117],
  "three-lines": [46, 63, 112],
  roundabout: [52, 71, 128],
  repair: [58, 83, 114],
  independent: [40, 73, 127],
};

const BASE_DIRECTIONS: Record<VerticalAnglesActivity, readonly [number, number, number]> = {
  crossing: [0, 18, -34],
  pairs: [12, -27, 41],
  "one-angle": [20, -36, 53],
  "three-lines": [8, -31, 47],
  roundabout: [16, -42, 61],
  repair: [25, -33, 49],
  independent: [14, -39, 57],
};

const THIRD_GAPS = [31, 44, 27] as const;
const GIVEN_INDICES: readonly [0 | 1 | 2 | 3, 0 | 1 | 2 | 3, 0 | 1 | 2 | 3] = [0, 1, 2];
const SECTOR_LABELS = ["α", "β", "γ", "δ"] as const;

export function normalizeIntersectionDirection(value: number): number {
  return ((value % 360) + 360) % 360;
}

function pointAt(origin: GeometryPointCoordinates, directionDegrees: number, length: number): GeometryPointCoordinates {
  const radians = directionDegrees * Math.PI / 180;
  return { x: origin.x + Math.cos(radians) * length, y: origin.y + Math.sin(radians) * length };
}

function directionBetween(origin: GeometryPointCoordinates, point: GeometryPointCoordinates): number {
  return normalizeIntersectionDirection(Math.atan2(point.y - origin.y, point.x - origin.x) * 180 / Math.PI);
}

function promptFor(config: VerticalAnglesSeedConfig): string {
  switch (config.activity) {
    case "crossing": return "Przeciągaj ramię prostej b. Obserwuj cztery miary oraz dwie niezmienne zależności przy przecięciu prostych.";
    case "pairs": return "Wskaż dwie etykiety kątów i nazwij parę. Symbol, wzór łuku i tekst muszą potwierdzać wybór.";
    case "one-angle": return "Znany jest jeden kąt. Najpierw wskaż własność, a dopiero potem odsłoń i oblicz pozostałe miary.";
    case "three-lines": return "Wybierz dwie z trzech prostych. Nieaktywna prosta zostanie wygaszona, a aktywne cztery kąty zachowają swoje własności.";
    case "roundabout": return "Oblicz miary na rondzie tramwajowym i dokończ dwa zdania: bo kąty wierzchołkowe…; bo kąty przyległe…";
    case "repair": return "Znajdź błędnie oznaczoną parę albo miarę, nazwij rodzaj błędu i zaproponuj poprawkę.";
    case "independent": return "Samodzielnie rozpoznaj parę, oblicz kąt wierzchołkowy i przyległy oraz uzasadnij obie zależności.";
  }
}

export function isVerticalAnglesLessonSeed(seed: number): boolean {
  if (!Number.isSafeInteger(seed) || seed < 440101 || seed > 440703) return false;
  const family = Math.floor((seed - 440000) / 100);
  return Boolean(ACTIVITIES[family] && DIFFICULTIES[seed % 100]);
}

export function getVerticalAnglesSeedConfig(seed: number): VerticalAnglesSeedConfig {
  if (!isVerticalAnglesLessonSeed(seed)) throw new Error(`Seed ${seed} nie należy do pakietu M5-4.4 L1.`);
  const activity = ACTIVITIES[Math.floor((seed - 440000) / 100)]!;
  const difficulty = DIFFICULTIES[seed % 100]!;
  const index = DIFFICULTY_INDEX[difficulty];
  const baseDirectionDegrees = BASE_DIRECTIONS[activity][index];
  const crossingAngleDegrees = CROSSING_ANGLES[activity][index];
  return {
    seed,
    activity,
    difficulty,
    baseDirectionDegrees,
    crossingAngleDegrees,
    thirdLineDirectionDegrees: activity === "three-lines"
      ? normalizeIntersectionDirection(baseDirectionDegrees + crossingAngleDegrees + THIRD_GAPS[index])
      : null,
    givenAngleIndex: GIVEN_INDICES[index],
    vertex: { x: 380, y: 260 },
  };
}

export function verticalAnglesSeedFor(activity: VerticalAnglesActivity, difficulty: LessonDifficulty): number {
  return VERTICAL_ANGLES_LESSON_SEEDS[activity][difficulty];
}

export function createPublicVerticalAnglesTask(seed: number): VerticalAnglesPublicTask {
  const config = getVerticalAnglesSeedConfig(seed);
  const measures = [config.crossingAngleDegrees, 180 - config.crossingAngleDegrees, config.crossingAngleDegrees, 180 - config.crossingAngleDegrees];
  return {
    generatorId: VERTICAL_ANGLES_GENERATOR_ID,
    generatorVersion: 1,
    ...config,
    givenMeasureDegrees: measures[config.givenAngleIndex]!,
    prompt: promptFor(config),
    skillIds: ["M5-4.4-angle-pairs-properties", "M5-4.4-angle-calculations"],
    invariants: [
      "vertical-pairs-have-equal-measures",
      "adjacent-linear-pairs-sum-to-180-degrees",
      "pair-marking-never-uses-color-alone",
      "four-measures-update-in-real-time",
      "touch-target-52-px",
      "keyboard-position-step-1-or-5-px",
      "keyboard-angle-step-1-or-5-degrees",
      "answer-spec-server-only",
    ],
  };
}

export function createVerticalAnglesGeometryState(seed: number, mode: GeometryLabMode = "practice"): GeometryLabState {
  const config = getVerticalAnglesSeedConfig(seed);
  const vertex = config.vertex;
  const directions: Array<[IntersectionLineId, number]> = [
    ["a", config.baseDirectionDegrees],
    ["b", config.baseDirectionDegrees + config.crossingAngleDegrees],
    ...(config.thirdLineDirectionDegrees === null ? [] : [["c" as const, config.thirdLineDirectionDegrees] as [IntersectionLineId, number]]),
  ];
  const points = directions.flatMap(([lineId, direction]) => [
    { id: `${lineId}-positive`, label: lineId.toUpperCase(), ...pointAt(vertex, direction, 250), locked: lineId === "a" },
    { id: `${lineId}-negative`, label: `${lineId.toUpperCase()}′`, ...pointAt(vertex, direction + 180, 250), locked: true },
  ]);
  return {
    version: 1,
    mode,
    viewport: { width: 760, height: 520, padding: 24, scale: 1 },
    grid: { visible: true, step: 20, snap: false },
    tolerance: { absolute: 1e-7, angleDegrees: 1, length: 4 },
    points: [
      { id: "vertex-o", label: "O", ...vertex, locked: true },
      ...points,
      { id: "seed-marker", label: "seed", x: seed, y: 0, locked: true },
    ],
    objects: directions.map(([lineId]) => ({ id: `line-${lineId}`, kind: "line" as const, startPointId: `${lineId}-negative`, endPointId: `${lineId}-positive`, label: `prosta ${lineId}` })),
    angles: [],
    polygon: { id: "intersection-placeholder", vertexIds: ["a-positive", "vertex-o", "b-positive"], closed: false, showSideLengths: false, showAngles: false, showClassification: false },
    constraints: [],
    selectedPointId: "b-positive",
    protractor: { visible: false, center: { ...vertex }, rotationDegrees: 0, radius: 140, scale: "outer" },
  };
}

export function intersectionSeedFromState(state: GeometryLabState): number {
  return Math.round(pointById(state.points, "seed-marker")?.x ?? 0);
}

export function intersectionLineDirection(state: GeometryLabState, lineId: IntersectionLineId): number {
  const vertex = pointById(state.points, "vertex-o")!;
  const positive = pointById(state.points, `${lineId}-positive`);
  if (!positive) throw new Error(`Brak prostej ${lineId} w stanie skrzyżowania.`);
  return directionBetween(vertex, positive);
}

export function setIntersectionLineDirection(state: GeometryLabState, lineId: IntersectionLineId, degrees: number): GeometryLabState {
  const vertex = pointById(state.points, "vertex-o")!;
  const positive = pointAt(vertex, degrees, 250);
  const negative = pointAt(vertex, degrees + 180, 250);
  return {
    ...state,
    selectedPointId: `${lineId}-positive`,
    points: state.points.map((point) => point.id === `${lineId}-positive`
      ? { ...point, ...positive }
      : point.id === `${lineId}-negative` ? { ...point, ...negative } : point),
  };
}

export function moveIntersectionLineHandle(state: GeometryLabState, lineId: IntersectionLineId, coordinates: GeometryPointCoordinates): GeometryLabState {
  const vertex = pointById(state.points, "vertex-o")!;
  return setIntersectionLineDirection(state, lineId, directionBetween(vertex, coordinates));
}

export function intersectionSectorsForPair(
  state: GeometryLabState,
  pair: readonly [IntersectionLineId, IntersectionLineId] = ["a", "b"],
): IntersectionSector[] {
  const rays = pair.flatMap((lineId) => {
    const direction = intersectionLineDirection(state, lineId);
    return [direction, normalizeIntersectionDirection(direction + 180)];
  }).sort((left, right) => left - right);
  return rays.map((start, index) => {
    const end = index === rays.length - 1 ? rays[0]! + 360 : rays[index + 1]!;
    const measure = end - start;
    return {
      index,
      label: SECTOR_LABELS[index]!,
      startDirectionDegrees: normalizeIntersectionDirection(start),
      endDirectionDegrees: normalizeIntersectionDirection(end),
      bisectorDirectionDegrees: normalizeIntersectionDirection(start + measure / 2),
      measureDegrees: Math.round(measure * 1_000_000) / 1_000_000,
    };
  });
}

export function atomicIntersectionSectors(state: GeometryLabState): Array<{ index: number; label: string; bisectorDirectionDegrees: number; measureDegrees: number }> {
  const lineIds = (["a", "b", "c"] as IntersectionLineId[]).filter((lineId) => pointById(state.points, `${lineId}-positive`));
  const rays = lineIds.flatMap((lineId) => {
    const direction = intersectionLineDirection(state, lineId);
    return [direction, normalizeIntersectionDirection(direction + 180)];
  }).sort((left, right) => left - right);
  return rays.map((start, index) => {
    const end = index === rays.length - 1 ? rays[0]! + 360 : rays[index + 1]!;
    const measure = end - start;
    return { index, label: String(index + 1), bisectorDirectionDegrees: normalizeIntersectionDirection(start + measure / 2), measureDegrees: Math.round(measure * 1_000_000) / 1_000_000 };
  });
}

export function relationForAnglePair(firstIndex: number, secondIndex: number): AnglePairRelation {
  if (firstIndex === secondIndex || ![firstIndex, secondIndex].every((value) => Number.isInteger(value) && value >= 0 && value <= 3)) return "neither";
  const difference = Math.abs(firstIndex - secondIndex);
  if (difference === 2) return "vertical";
  if (difference === 1 || difference === 3) return "adjacent";
  return "neither";
}

export function anglePairInvariant(state: GeometryLabState, firstIndex: number, secondIndex: number): { relation: AnglePairRelation; firstDegrees: number; secondDegrees: number; equal: boolean; sumDegrees: number } {
  const sectors = intersectionSectorsForPair(state);
  const firstDegrees = sectors[firstIndex]?.measureDegrees ?? Number.NaN;
  const secondDegrees = sectors[secondIndex]?.measureDegrees ?? Number.NaN;
  return {
    relation: relationForAnglePair(firstIndex, secondIndex),
    firstDegrees,
    secondDegrees,
    equal: Math.abs(firstDegrees - secondDegrees) <= state.tolerance.angleDegrees,
    sumDegrees: Math.round((firstDegrees + secondDegrees) * 1_000_000) / 1_000_000,
  };
}
