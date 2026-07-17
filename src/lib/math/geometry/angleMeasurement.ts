import { angleBetweenPointsDegrees, geometryDistance, pointById } from "@/lib/math/geometry/geometryMath";
import type { LessonDifficulty } from "@/types/lessonPackage";
import type {
  GeometryLabMode,
  GeometryLabState,
  GeometryPointCoordinates,
  GeometryProtractor,
} from "@/types/geometry";

export const ANGLE_MEASUREMENT_GENERATOR_ID = "geometry-angle-measurement-l1-v1" as const;

export type AngleMeasurementActivity = "setup" | "scale" | "series" | "independent";

export const ANGLE_MEASUREMENT_LESSON_SEEDS = {
  setup: { support: 430101, core: 430102, challenge: 430103 },
  scale: { support: 430201, core: 430202, challenge: 430203 },
  series: { support: 430301, core: 430302, challenge: 430303 },
  independent: { support: 430401, core: 430402, challenge: 430403 },
} as const satisfies Record<AngleMeasurementActivity, Record<LessonDifficulty, number>>;

export interface AngleMeasurementSeedConfig {
  seed: number;
  activity: AngleMeasurementActivity;
  difficulty: LessonDifficulty;
  angleDegrees: number;
  baseDirectionDegrees: number;
  startSide: "left" | "right";
  correctScale: "inner" | "outer";
  vertex: GeometryPointCoordinates;
  initialCenterOffset: GeometryPointCoordinates;
  initialRotationOffsetDegrees: number;
}

export interface AngleMeasurementPublicTask extends AngleMeasurementSeedConfig {
  generatorId: typeof ANGLE_MEASUREMENT_GENERATOR_ID;
  generatorVersion: 1;
  prompt: string;
  skillIds: readonly ["M5-4.3-measure-angles"];
  invariants: readonly string[];
}

export interface AngleMeasurementPlacement {
  centerDistancePx: number;
  baselineDifferenceDegrees: number;
  centerAligned: boolean;
  baselineAligned: boolean;
  ready: boolean;
  scaleCorrect: boolean;
}

export interface AngleMeasurementSnapResult {
  state: GeometryLabState;
  centerSnapped: boolean;
  baselineSnapped: boolean;
}

export const ANGLE_MEASUREMENT_CENTER_SNAP_PX = 36;
export const ANGLE_MEASUREMENT_BASELINE_SNAP_DEGREES = 8;

const ACTIVITY_FROM_FAMILY: Record<number, AngleMeasurementActivity> = {
  1: "setup",
  2: "scale",
  3: "series",
  4: "independent",
};

const DIFFICULTY_FROM_SUFFIX: Record<number, LessonDifficulty> = {
  1: "support",
  2: "core",
  3: "challenge",
};

const DIFFICULTY_INDEX: Record<LessonDifficulty, number> = {
  support: 0,
  core: 1,
  challenge: 2,
};

const ANGLES: Record<AngleMeasurementActivity, readonly [number, number, number]> = {
  setup: [40, 67, 123],
  scale: [47, 133, 68],
  series: [36, 92, 147],
  independent: [58, 113, 79],
};

const BASE_DIRECTIONS: Record<AngleMeasurementActivity, readonly [number, number, number]> = {
  setup: [15, -32, 48],
  scale: [22, -37, 61],
  series: [28, -47, 123],
  independent: [37, -61, 142],
};

const START_SIDES: Record<AngleMeasurementActivity, readonly ["left" | "right", "left" | "right", "left" | "right"]> = {
  setup: ["right", "left", "right"],
  scale: ["right", "left", "left"],
  series: ["right", "left", "right"],
  independent: ["right", "left", "right"],
};

const CENTER_OFFSETS: readonly [GeometryPointCoordinates, GeometryPointCoordinates, GeometryPointCoordinates] = [
  { x: -92, y: 82 },
  { x: 104, y: 70 },
  { x: -78, y: -86 },
];

const ROTATION_OFFSETS = [24, -31, 43] as const;

function promptFor(activity: AngleMeasurementActivity): string {
  switch (activity) {
    case "setup":
      return "Przeciągnij środek kątomierza na wierzchołek B i obróć linię 0°–180° do ramienia bazowego. Gotowość wymaga obu ustawień.";
    case "scale":
      return "Zacznij od zera leżącego na ramieniu bazowym. Wybierz właściwą skalę; druga pozostaje widoczna jako kontrprzykład.";
    case "series":
      return "Zmierz trzy kąty w nietypowych orientacjach. Po zmianie kąta kątomierz zachowuje położenie i obrót — ustaw go samodzielnie.";
    case "independent":
      return "Wykonaj samodzielny pomiar: ustaw środek i bazę, wybierz zero właściwej skali, a potem zapisz miarę z dokładnością do 1°.";
  }
}

export function isAngleMeasurementLessonSeed(seed: number): boolean {
  if (!Number.isSafeInteger(seed) || seed < 430101 || seed > 430403) return false;
  const family = Math.floor((seed - 430000) / 100);
  return Boolean(ACTIVITY_FROM_FAMILY[family] && DIFFICULTY_FROM_SUFFIX[seed % 100]);
}

export function getAngleMeasurementSeedConfig(seed: number): AngleMeasurementSeedConfig {
  if (!isAngleMeasurementLessonSeed(seed)) {
    throw new Error(`Seed ${seed} nie należy do pakietu M5-4.3 L1.`);
  }
  const family = Math.floor((seed - 430000) / 100);
  const activity = ACTIVITY_FROM_FAMILY[family]!;
  const difficulty = DIFFICULTY_FROM_SUFFIX[seed % 100]!;
  const index = DIFFICULTY_INDEX[difficulty];
  const startSide = START_SIDES[activity][index];
  return {
    seed,
    activity,
    difficulty,
    angleDegrees: ANGLES[activity][index],
    baseDirectionDegrees: BASE_DIRECTIONS[activity][index],
    startSide,
    correctScale: startSide === "right" ? "outer" : "inner",
    vertex: { x: 380, y: 255 },
    initialCenterOffset: CENTER_OFFSETS[index],
    initialRotationOffsetDegrees: ROTATION_OFFSETS[index],
  };
}

export function angleMeasurementSeedFor(
  activity: AngleMeasurementActivity,
  difficulty: LessonDifficulty,
): number {
  return ANGLE_MEASUREMENT_LESSON_SEEDS[activity][difficulty];
}

export function createPublicAngleMeasurementTask(seed: number): AngleMeasurementPublicTask {
  const config = getAngleMeasurementSeedConfig(seed);
  return {
    generatorId: ANGLE_MEASUREMENT_GENERATOR_ID,
    generatorVersion: 1,
    ...config,
    prompt: promptFor(config.activity),
    skillIds: ["M5-4.3-measure-angles"],
    invariants: [
      "readiness-requires-center-and-baseline",
      "both-protractor-scales-remain-visible",
      "series-never-auto-positions-the-tool",
      "keyboard-center-step-1-or-5-px",
      "keyboard-rotation-step-1-or-5-degrees",
      "answer-spec-server-only",
    ],
  };
}

export function normalizeMeasurementDirection(value: number): number {
  return ((value % 360) + 360) % 360;
}

function pointAt(
  origin: GeometryPointCoordinates,
  directionDegrees: number,
  length: number,
): GeometryPointCoordinates {
  const radians = directionDegrees * Math.PI / 180;
  return {
    x: origin.x + Math.cos(radians) * length,
    y: origin.y + Math.sin(radians) * length,
  };
}

export function desiredProtractorRotationDegrees(config: AngleMeasurementSeedConfig): number {
  return normalizeMeasurementDirection(
    config.startSide === "right" ? config.baseDirectionDegrees : config.baseDirectionDegrees - 180,
  );
}

export function createAngleMeasurementGeometryState(
  seed: number,
  mode: GeometryLabMode = "practice",
  preservedProtractor?: GeometryProtractor,
): GeometryLabState {
  const config = getAngleMeasurementSeedConfig(seed);
  const vertex = config.vertex;
  const base = pointAt(vertex, config.baseDirectionDegrees, 250);
  const secondDirection = config.startSide === "right"
    ? config.baseDirectionDegrees - config.angleDegrees
    : config.baseDirectionDegrees + config.angleDegrees;
  const second = pointAt(vertex, secondDirection, 205);
  const desiredRotation = desiredProtractorRotationDegrees(config);
  const protractor = preservedProtractor ? {
    ...preservedProtractor,
    center: { ...preservedProtractor.center },
  } : {
    visible: true,
    center: {
      x: vertex.x + config.initialCenterOffset.x,
      y: vertex.y + config.initialCenterOffset.y,
    },
    rotationDegrees: normalizeMeasurementDirection(desiredRotation + config.initialRotationOffsetDegrees),
    radius: config.activity === "setup" ? 175 : 150,
    scale: config.correctScale === "outer" ? "inner" as const : "outer" as const,
  };

  return {
    version: 1,
    mode,
    viewport: { width: 760, height: 500, padding: 26, scale: 1 },
    grid: { visible: true, step: 20, snap: false },
    tolerance: { absolute: 1e-7, angleDegrees: 1, length: 4 },
    points: [
      { id: "vertex-b", label: "B", ...vertex, locked: true },
      { id: "point-a", label: "A", ...base, locked: true },
      { id: "point-c", label: "C", ...second, locked: true },
      { id: "seed-marker", label: "seed", x: seed, y: 0, locked: true },
    ],
    objects: [
      { id: "ray-ba", kind: "ray", startPointId: "vertex-b", endPointId: "point-a", label: "ramię bazowe BA" },
      { id: "ray-bc", kind: "ray", startPointId: "vertex-b", endPointId: "point-c", label: "ramię odczytu BC" },
    ],
    angles: [{
      id: "angle-abc",
      startPointId: "point-a",
      vertexPointId: "vertex-b",
      endPointId: "point-c",
      label: "∠ABC",
      showArc: true,
      showMeasure: false,
    }],
    polygon: {
      id: "angle-measurement-placeholder",
      vertexIds: ["point-a", "vertex-b", "point-c"],
      closed: false,
      showSideLengths: false,
      showAngles: false,
      showClassification: false,
    },
    constraints: [],
    selectedPointId: null,
    protractor,
  };
}

export function measurementAngleDegrees(state: GeometryLabState): number {
  const base = pointById(state.points, "point-a")!;
  const vertex = pointById(state.points, "vertex-b")!;
  const second = pointById(state.points, "point-c")!;
  return Math.round(angleBetweenPointsDegrees(base, vertex, second) * 1_000_000) / 1_000_000;
}

export function measurementBaseDirectionDegrees(state: GeometryLabState): number {
  const base = pointById(state.points, "point-a")!;
  const vertex = pointById(state.points, "vertex-b")!;
  return normalizeMeasurementDirection(Math.atan2(base.y - vertex.y, base.x - vertex.x) * 180 / Math.PI);
}

function circularDifferenceDegrees(left: number, right: number): number {
  const difference = Math.abs(normalizeMeasurementDirection(left) - normalizeMeasurementDirection(right));
  return Math.min(difference, 360 - difference);
}

export function analyzeProtractorPlacement(state: GeometryLabState): AngleMeasurementPlacement {
  const seed = Math.round(pointById(state.points, "seed-marker")?.x ?? 0);
  const config = getAngleMeasurementSeedConfig(seed);
  const vertex = pointById(state.points, "vertex-b")!;
  const centerDistancePx = geometryDistance(state.protractor.center, vertex);
  const baselineDifferenceDegrees = circularDifferenceDegrees(
    state.protractor.rotationDegrees,
    desiredProtractorRotationDegrees(config),
  );
  const centerAligned = centerDistancePx <= 4;
  const baselineAligned = baselineDifferenceDegrees <= 1;
  return {
    centerDistancePx,
    baselineDifferenceDegrees,
    centerAligned,
    baselineAligned,
    ready: centerAligned && baselineAligned,
    scaleCorrect: state.protractor.scale === config.correctScale,
  };
}

export function moveMeasurementProtractor(
  state: GeometryLabState,
  center: GeometryPointCoordinates,
): GeometryLabState {
  return { ...state, protractor: { ...state.protractor, center: { ...center } } };
}

export function rotateMeasurementProtractorTo(state: GeometryLabState, degrees: number): GeometryLabState {
  return {
    ...state,
    protractor: { ...state.protractor, rotationDegrees: normalizeMeasurementDirection(degrees) },
  };
}

export function rotateMeasurementProtractorBy(state: GeometryLabState, deltaDegrees: number): GeometryLabState {
  return rotateMeasurementProtractorTo(state, state.protractor.rotationDegrees + deltaDegrees);
}

/**
 * Przyciąga kątomierz dopiero po zakończeniu gestu. Oba snapy są niezależne:
 * środek może trafić w wierzchołek bez poprawnego obrotu, a baza może zostać
 * wyrównana jeszcze przed dosunięciem środka. Przeciągnięcie poza tolerancję
 * odrywa narzędzie od poprzedniego snapa.
 */
export function snapMeasurementProtractorAfterDrop(
  state: GeometryLabState,
  centerTolerancePx = ANGLE_MEASUREMENT_CENTER_SNAP_PX,
  baselineToleranceDegrees = ANGLE_MEASUREMENT_BASELINE_SNAP_DEGREES,
): AngleMeasurementSnapResult {
  const seed = Math.round(pointById(state.points, "seed-marker")?.x ?? 0);
  const config = getAngleMeasurementSeedConfig(seed);
  const vertex = pointById(state.points, "vertex-b")!;
  const desiredRotation = desiredProtractorRotationDegrees(config);
  const centerSnapped = geometryDistance(state.protractor.center, vertex) <= centerTolerancePx;
  const baselineSnapped = circularDifferenceDegrees(
    state.protractor.rotationDegrees,
    desiredRotation,
  ) <= baselineToleranceDegrees;

  return {
    state: {
      ...state,
      protractor: {
        ...state.protractor,
        center: centerSnapped ? { x: vertex.x, y: vertex.y } : { ...state.protractor.center },
        rotationDegrees: baselineSnapped ? desiredRotation : state.protractor.rotationDegrees,
      },
    },
    centerSnapped,
    baselineSnapped,
  };
}

export function setMeasurementProtractorScale(
  state: GeometryLabState,
  scale: "inner" | "outer",
): GeometryLabState {
  return { ...state, protractor: { ...state.protractor, scale } };
}

export function readingForSelectedScale(state: GeometryLabState): number {
  const actual = measurementAngleDegrees(state);
  const seed = Math.round(pointById(state.points, "seed-marker")?.x ?? 0);
  const config = getAngleMeasurementSeedConfig(seed);
  return state.protractor.scale === config.correctScale ? actual : 180 - actual;
}
