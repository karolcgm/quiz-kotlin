import { geometryDistance, pointById } from "@/lib/math/geometry/geometryMath";
import type { LessonDifficulty } from "@/types/lessonPackage";
import type {
  GeometryLabMode,
  GeometryLabState,
  GeometryPointCoordinates,
} from "@/types/geometry";

export const ANGLE_DRAWING_GENERATOR_ID = "geometry-angle-drawing-l2-v1" as const;

export type AngleDrawingActivity = "workflow" | "variants" | "peer-check" | "independent";
export type AngleDrawingPhase = "base-ray" | "measure-mark" | "second-ray" | "complete";

export const ANGLE_DRAWING_LESSON_SEEDS = {
  workflow: { support: 431101, core: 431102, challenge: 431103 },
  variants: { support: 431201, core: 431202, challenge: 431203 },
  "peer-check": { support: 431301, core: 431302, challenge: 431303 },
  independent: { support: 431401, core: 431402, challenge: 431403 },
} as const satisfies Record<AngleDrawingActivity, Record<LessonDifficulty, number>>;

export interface AngleDrawingSeedConfig {
  seed: number;
  activity: AngleDrawingActivity;
  difficulty: LessonDifficulty;
  targetDegrees: number;
  baseDirectionDegrees: number;
  startSide: "left" | "right";
  correctScale: "inner" | "outer";
  vertex: GeometryPointCoordinates;
}

export interface AngleDrawingPublicTask extends AngleDrawingSeedConfig {
  generatorId: typeof ANGLE_DRAWING_GENERATOR_ID;
  generatorVersion: 1;
  prompt: string;
  skillIds: readonly ["M5-4.3-draw-angles"];
  invariants: readonly string[];
}

export interface AngleDrawingAnalysis {
  phase: AngleDrawingPhase;
  baseDirectionDegrees: number;
  baseDifferenceDegrees: number;
  centerDistancePx: number;
  baselineDifferenceDegrees: number;
  centerAligned: boolean;
  baselineAligned: boolean;
  scaleCorrect: boolean;
  markerDegrees: number;
  markerDifferenceDegrees: number;
  secondRayDegrees: number;
  secondRayDifferenceDegrees: number;
  constructionCorrect: boolean;
}

const ACTIVITY_FROM_FAMILY: Record<number, AngleDrawingActivity> = {
  1: "workflow",
  2: "variants",
  3: "peer-check",
  4: "independent",
};

const DIFFICULTY_FROM_SUFFIX: Record<number, LessonDifficulty> = {
  1: "support",
  2: "core",
  3: "challenge",
};

const DIFFICULTY_INDEX: Record<LessonDifficulty, number> = { support: 0, core: 1, challenge: 2 };

const TARGETS: Record<AngleDrawingActivity, readonly [number, number, number]> = {
  workflow: [65, 65, 65],
  variants: [42, 97, 136],
  "peer-check": [73, 108, 54],
  independent: [48, 112, 137],
};

const BASE_DIRECTIONS: Record<AngleDrawingActivity, readonly [number, number, number]> = {
  workflow: [0, -28, 34],
  variants: [18, 143, -64],
  "peer-check": [27, 156, -48],
  independent: [36, 132, -73],
};

const START_SIDES: Record<AngleDrawingActivity, readonly ["left" | "right", "left" | "right", "left" | "right"]> = {
  workflow: ["right", "right", "left"],
  variants: ["right", "left", "right"],
  "peer-check": ["right", "left", "right"],
  independent: ["right", "left", "right"],
};

const PHASES: AngleDrawingPhase[] = ["base-ray", "measure-mark", "second-ray", "complete"];

function normalizeDirection(value: number): number {
  return ((value % 360) + 360) % 360;
}

function circularDifference(left: number, right: number): number {
  const difference = Math.abs(normalizeDirection(left) - normalizeDirection(right));
  return Math.min(difference, 360 - difference);
}

function pointAt(origin: GeometryPointCoordinates, directionDegrees: number, length: number): GeometryPointCoordinates {
  const radians = directionDegrees * Math.PI / 180;
  return { x: origin.x + Math.cos(radians) * length, y: origin.y + Math.sin(radians) * length };
}

function directionBetween(origin: GeometryPointCoordinates, point: GeometryPointCoordinates): number {
  return normalizeDirection(Math.atan2(point.y - origin.y, point.x - origin.x) * 180 / Math.PI);
}

function promptFor(config: AngleDrawingSeedConfig): string {
  const orientation = `promień bazowy ${normalizeDirection(config.baseDirectionDegrees)}° względem osi ekranu`;
  switch (config.activity) {
    case "workflow":
      return `Narysuj ${config.targetDegrees}° w kolejności: ${orientation} → znacznik miary → drugie ramię.`;
    case "variants":
      return `Narysuj ${config.targetDegrees}° w nietypowej orientacji (${orientation}). Samodzielnie wybierz zero i skalę.`;
    case "peer-check":
      return `Narysuj ${config.targetDegrees}°, a potem poproś partnera o anonimowy pomiar. Różnica do 1° jest akceptowana.`;
    case "independent":
      return `Samodzielnie skonstruuj ${config.targetDegrees}°: promień bazowy, znacznik miary, drugie ramię i kontrola do 1°.`;
  }
}

export function isAngleDrawingLessonSeed(seed: number): boolean {
  if (!Number.isSafeInteger(seed) || seed < 431101 || seed > 431403) return false;
  const family = Math.floor((seed - 431000) / 100);
  return Boolean(ACTIVITY_FROM_FAMILY[family] && DIFFICULTY_FROM_SUFFIX[seed % 100]);
}

export function getAngleDrawingSeedConfig(seed: number): AngleDrawingSeedConfig {
  if (!isAngleDrawingLessonSeed(seed)) throw new Error(`Seed ${seed} nie należy do pakietu M5-4.3 L2.`);
  const activity = ACTIVITY_FROM_FAMILY[Math.floor((seed - 431000) / 100)]!;
  const difficulty = DIFFICULTY_FROM_SUFFIX[seed % 100]!;
  const index = DIFFICULTY_INDEX[difficulty];
  const startSide = START_SIDES[activity][index];
  return {
    seed,
    activity,
    difficulty,
    targetDegrees: TARGETS[activity][index],
    baseDirectionDegrees: BASE_DIRECTIONS[activity][index],
    startSide,
    correctScale: startSide === "right" ? "outer" : "inner",
    vertex: { x: 380, y: 270 },
  };
}

export function angleDrawingSeedFor(activity: AngleDrawingActivity, difficulty: LessonDifficulty): number {
  return ANGLE_DRAWING_LESSON_SEEDS[activity][difficulty];
}

export function createPublicAngleDrawingTask(seed: number): AngleDrawingPublicTask {
  const config = getAngleDrawingSeedConfig(seed);
  return {
    generatorId: ANGLE_DRAWING_GENERATOR_ID,
    generatorVersion: 1,
    ...config,
    prompt: promptFor(config),
    skillIds: ["M5-4.3-draw-angles"],
    invariants: [
      "ordered-base-mark-second-ray",
      "peer-reading-has-no-name-field",
      "peer-difference-tolerance-1-degree",
      "touch-target-52-px",
      "keyboard-position-step-1-or-5-px",
      "keyboard-angle-step-1-or-5-degrees",
      "answer-spec-server-only",
    ],
  };
}

export function expectedSecondRayDirection(config: AngleDrawingSeedConfig): number {
  return normalizeDirection(config.startSide === "right"
    ? config.baseDirectionDegrees - config.targetDegrees
    : config.baseDirectionDegrees + config.targetDegrees);
}

export function desiredDrawingProtractorRotation(config: AngleDrawingSeedConfig): number {
  return normalizeDirection(config.startSide === "right" ? config.baseDirectionDegrees : config.baseDirectionDegrees - 180);
}

export function createAngleDrawingGeometryState(seed: number, mode: GeometryLabMode = "practice"): GeometryLabState {
  const config = getAngleDrawingSeedConfig(seed);
  const vertex = config.vertex;
  const base = pointAt(vertex, config.baseDirectionDegrees + 9, 245);
  const expectedSecond = expectedSecondRayDirection(config);
  const mark = pointAt(vertex, expectedSecond + 12, 145);
  const second = pointAt(vertex, expectedSecond + 20, 215);
  return {
    version: 1,
    mode,
    viewport: { width: 760, height: 520, padding: 24, scale: 1 },
    grid: { visible: true, step: 20, snap: false },
    tolerance: { absolute: 1e-7, angleDegrees: 1, length: 4 },
    points: [
      { id: "vertex-b", label: "B", ...vertex, locked: true },
      { id: "point-a", label: "A", ...base, locked: false },
      { id: "measure-mark", label: "M", ...mark, locked: false },
      { id: "point-c", label: "C", ...second, locked: false },
      { id: "phase-marker", label: "phase", x: 0, y: 0, locked: true },
      { id: "seed-marker", label: "seed", x: seed, y: 0, locked: true },
    ],
    objects: [
      { id: "ray-ba", kind: "ray", startPointId: "vertex-b", endPointId: "point-a", label: "promień bazowy BA" },
      { id: "ray-bc", kind: "ray", startPointId: "vertex-b", endPointId: "point-c", label: "drugie ramię BC" },
    ],
    angles: [{ id: "angle-abc", startPointId: "point-a", vertexPointId: "vertex-b", endPointId: "point-c", label: "∠ABC", showArc: true, showMeasure: false }],
    polygon: { id: "angle-drawing-placeholder", vertexIds: ["point-a", "vertex-b", "point-c"], closed: false, showSideLengths: false, showAngles: false, showClassification: false },
    constraints: [],
    selectedPointId: "point-a",
    protractor: {
      visible: true,
      center: { x: vertex.x + 72, y: vertex.y + 58 },
      rotationDegrees: normalizeDirection(desiredDrawingProtractorRotation(config) + 17),
      radius: 150,
      scale: config.correctScale === "outer" ? "inner" : "outer",
    },
  };
}

export function angleDrawingPhase(state: GeometryLabState): AngleDrawingPhase {
  const index = Math.max(0, Math.min(3, Math.round(pointById(state.points, "phase-marker")?.x ?? 0)));
  return PHASES[index]!;
}

export function setAngleDrawingPhase(state: GeometryLabState, phase: AngleDrawingPhase): GeometryLabState {
  const index = PHASES.indexOf(phase);
  return { ...state, points: state.points.map((point) => point.id === "phase-marker" ? { ...point, x: index } : point) };
}

export function setAngleDrawingPoint(state: GeometryLabState, pointId: "point-a" | "measure-mark" | "point-c", coordinates: GeometryPointCoordinates): GeometryLabState {
  return { ...state, points: state.points.map((point) => point.id === pointId ? { ...point, ...coordinates } : point), selectedPointId: pointId };
}

export function setAngleDrawingPointDirection(state: GeometryLabState, pointId: "point-a" | "measure-mark" | "point-c", degrees: number): GeometryLabState {
  const vertex = pointById(state.points, "vertex-b")!;
  const lengths = { "point-a": 245, "measure-mark": 145, "point-c": 215 } as const;
  return setAngleDrawingPoint(state, pointId, pointAt(vertex, degrees, lengths[pointId]));
}

export function selectedDrawingMarkerDegrees(state: GeometryLabState): number {
  const config = getAngleDrawingSeedConfig(Math.round(pointById(state.points, "seed-marker")?.x ?? 0));
  const vertex = pointById(state.points, "vertex-b")!;
  const mark = pointById(state.points, "measure-mark")!;
  const markDirection = directionBetween(vertex, mark);
  const directed = config.startSide === "right"
    ? normalizeDirection(config.baseDirectionDegrees - markDirection)
    : normalizeDirection(markDirection - config.baseDirectionDegrees);
  return directed > 180 ? 360 - directed : directed;
}

export function constructedAngleDegrees(state: GeometryLabState): number {
  const vertex = pointById(state.points, "vertex-b")!;
  const base = pointById(state.points, "point-a")!;
  const second = pointById(state.points, "point-c")!;
  const difference = circularDifference(directionBetween(vertex, base), directionBetween(vertex, second));
  return Math.round(difference * 1_000_000) / 1_000_000;
}

export function analyzeAngleDrawing(state: GeometryLabState): AngleDrawingAnalysis {
  const config = getAngleDrawingSeedConfig(Math.round(pointById(state.points, "seed-marker")?.x ?? 0));
  const vertex = pointById(state.points, "vertex-b")!;
  const base = pointById(state.points, "point-a")!;
  const second = pointById(state.points, "point-c")!;
  const baseDirectionDegrees = directionBetween(vertex, base);
  const baseDifferenceDegrees = circularDifference(baseDirectionDegrees, config.baseDirectionDegrees);
  const centerDistancePx = geometryDistance(state.protractor.center, vertex);
  const baselineDifferenceDegrees = circularDifference(state.protractor.rotationDegrees, desiredDrawingProtractorRotation(config));
  const markerDegrees = selectedDrawingMarkerDegrees(state);
  const markerDifferenceDegrees = Math.abs(markerDegrees - config.targetDegrees);
  const secondRayDegrees = constructedAngleDegrees(state);
  const secondRayDifferenceDegrees = circularDifference(directionBetween(vertex, second), expectedSecondRayDirection(config));
  const centerAligned = centerDistancePx <= 4;
  const baselineAligned = baselineDifferenceDegrees <= 1;
  const scaleCorrect = state.protractor.scale === config.correctScale;
  return {
    phase: angleDrawingPhase(state),
    baseDirectionDegrees,
    baseDifferenceDegrees,
    centerDistancePx,
    baselineDifferenceDegrees,
    centerAligned,
    baselineAligned,
    scaleCorrect,
    markerDegrees,
    markerDifferenceDegrees,
    secondRayDegrees,
    secondRayDifferenceDegrees,
    constructionCorrect: baseDifferenceDegrees <= 1 && centerAligned && baselineAligned && scaleCorrect && markerDifferenceDegrees <= 1 && secondRayDifferenceDegrees <= 1,
  };
}

export function moveDrawingProtractor(state: GeometryLabState, center: GeometryPointCoordinates): GeometryLabState {
  return { ...state, protractor: { ...state.protractor, center: { ...center } } };
}

export function rotateDrawingProtractor(state: GeometryLabState, rotationDegrees: number): GeometryLabState {
  return { ...state, protractor: { ...state.protractor, rotationDegrees: normalizeDirection(rotationDegrees) } };
}

export function setDrawingProtractorScale(state: GeometryLabState, scale: "inner" | "outer"): GeometryLabState {
  return { ...state, protractor: { ...state.protractor, scale } };
}
