import {
  areParallelVectors,
  arePerpendicularVectors,
  geometryCross,
  geometryObjectVector,
  geometryVector,
  pointById,
} from "@/lib/math/geometry/geometryMath";
import { GEOMETRY_FEEDBACK_CODES } from "@/types/geometry";
import type {
  GeometryFeedbackCode,
  GeometryLabMode,
  GeometryLabState,
  GeometryObject,
  GeometryPointCoordinates,
} from "@/types/geometry";

export type LineConstructionActivity = "perpendicular" | "parallel" | "network";
export type LineConstructionDifficulty = "support" | "core" | "challenge";

export const LINE_CONSTRUCTION_LESSON_SEEDS = {
  support: 411_101,
  core: 411_201,
  challenge: 411_301,
} as const satisfies Record<LineConstructionDifficulty, number>;

const LINE_LENGTH = 270;
const TOOL_EDGE_LENGTH = 120;

export interface LineConstructionSeedConfig {
  seed: number;
  difficulty: LineConstructionDifficulty;
  activity: LineConstructionActivity;
  referenceAngle: number;
}

export interface LineConstructionCondition {
  id: string;
  symbol: string;
  label: string;
  met: boolean;
}

export interface LineConstructionAnalysis {
  activity: LineConstructionActivity;
  complete: boolean;
  conditions: LineConstructionCondition[];
  errorCodes: GeometryFeedbackCode[];
  angleAB: number;
  angleBC: number;
}

function normalizeDirection(degrees: number): number {
  return ((degrees % 180) + 180) % 180;
}

function angleDifference(left: number, right: number): number {
  const raw = Math.abs(normalizeDirection(left) - normalizeDirection(right));
  return Math.min(raw, 180 - raw);
}

function endpoints(
  center: GeometryPointCoordinates,
  angleDegrees: number,
  length = LINE_LENGTH,
): [GeometryPointCoordinates, GeometryPointCoordinates] {
  const radians = angleDegrees * Math.PI / 180;
  const offset = {
    x: Math.cos(radians) * length / 2,
    y: Math.sin(radians) * length / 2,
  };
  return [
    { x: center.x - offset.x, y: center.y - offset.y },
    { x: center.x + offset.x, y: center.y + offset.y },
  ];
}

function difficultyForSeed(seed: number): LineConstructionDifficulty {
  const local = Math.abs(Math.trunc(seed)) % 1_000;
  if (local >= 300) return "challenge";
  if (local >= 200) return "core";
  return "support";
}

export function isLineConstructionLessonSeed(seed: number): boolean {
  const value = Math.abs(Math.trunc(seed));
  return value >= 411_100 && value <= 411_399;
}

export function getLineConstructionSeedConfig(seed: number): LineConstructionSeedConfig {
  const normalizedSeed = Number.isFinite(seed)
    ? Math.abs(Math.trunc(seed))
    : LINE_CONSTRUCTION_LESSON_SEEDS.support;
  const difficulty = difficultyForSeed(normalizedSeed);
  if (difficulty === "challenge") {
    return { seed: normalizedSeed, difficulty, activity: "network", referenceAngle: 32 };
  }
  if (difficulty === "core") {
    return { seed: normalizedSeed, difficulty, activity: "parallel", referenceAngle: 28 };
  }
  return { seed: normalizedSeed, difficulty, activity: "perpendicular", referenceAngle: 0 };
}

function lineObject(state: GeometryLabState, lineId: "line-a" | "line-b" | "line-c"): GeometryObject {
  const object = state.objects.find((candidate) => candidate.id === lineId);
  if (!object) throw new Error(`Brak ${lineId} w konstrukcji prostych.`);
  return object;
}

function replacePoint(
  state: GeometryLabState,
  pointId: string,
  coordinates: GeometryPointCoordinates,
): GeometryLabState {
  return {
    ...state,
    points: state.points.map((point) => point.id === pointId ? { ...point, ...coordinates } : point),
  };
}

export function lineConstructionCenter(
  state: GeometryLabState,
  lineId: "line-a" | "line-b" | "line-c",
): GeometryPointCoordinates {
  const object = lineObject(state, lineId);
  const start = pointById(state.points, object.startPointId);
  const end = pointById(state.points, object.endPointId);
  if (!start || !end) throw new Error(`Niepełne końce ${lineId}.`);
  return { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 };
}

export function lineConstructionAngle(
  state: GeometryLabState,
  lineId: "line-a" | "line-b" | "line-c",
): number {
  const vector = geometryObjectVector(state, lineObject(state, lineId));
  if (!vector) return Number.NaN;
  return normalizeDirection(Math.atan2(vector.y, vector.x) * 180 / Math.PI);
}

export function setConstructionLinePose(
  state: GeometryLabState,
  lineId: "line-b" | "line-c",
  center: GeometryPointCoordinates,
  angleDegrees: number,
): GeometryLabState {
  const object = lineObject(state, lineId);
  const [start, end] = endpoints(center, angleDegrees);
  return replacePoint(replacePoint(state, object.startPointId, start), object.endPointId, end);
}

export function translateConstructionLine(
  state: GeometryLabState,
  lineId: "line-b" | "line-c",
  dx: number,
  dy: number,
): GeometryLabState {
  const center = lineConstructionCenter(state, lineId);
  return setConstructionLinePose(
    state,
    lineId,
    { x: center.x + dx, y: center.y + dy },
    lineConstructionAngle(state, lineId),
  );
}

export function rotateConstructionLine(
  state: GeometryLabState,
  lineId: "line-b" | "line-c",
  angleDegrees: number,
): GeometryLabState {
  return setConstructionLinePose(state, lineId, lineConstructionCenter(state, lineId), angleDegrees);
}

export function trySquarePose(state: GeometryLabState): {
  origin: GeometryPointCoordinates;
  angleDegrees: number;
} {
  const origin = pointById(state.points, "tool-origin");
  const base = pointById(state.points, "tool-base");
  if (!origin || !base) throw new Error("Ekierka nie ma pełnej pozycji.");
  return {
    origin: { x: origin.x, y: origin.y },
    angleDegrees: normalizeDirection(Math.atan2(base.y - origin.y, base.x - origin.x) * 180 / Math.PI),
  };
}

export function moveTrySquare(
  state: GeometryLabState,
  origin: GeometryPointCoordinates,
): GeometryLabState {
  const pose = trySquarePose(state);
  const radians = pose.angleDegrees * Math.PI / 180;
  const base = {
    x: origin.x + Math.cos(radians) * TOOL_EDGE_LENGTH,
    y: origin.y + Math.sin(radians) * TOOL_EDGE_LENGTH,
  };
  return replacePoint(replacePoint(state, "tool-origin", origin), "tool-base", base);
}

export function rotateTrySquare(state: GeometryLabState, angleDegrees: number): GeometryLabState {
  const pose = trySquarePose(state);
  const radians = angleDegrees * Math.PI / 180;
  return replacePoint(state, "tool-base", {
    x: pose.origin.x + Math.cos(radians) * TOOL_EDGE_LENGTH,
    y: pose.origin.y + Math.sin(radians) * TOOL_EDGE_LENGTH,
  });
}

export function constructPerpendicularFromTrySquare(state: GeometryLabState): GeometryLabState {
  const pose = trySquarePose(state);
  return setConstructionLinePose(state, "line-b", pose.origin, pose.angleDegrees + 90);
}

function lineDistance(
  state: GeometryLabState,
  lineId: "line-a" | "line-b" | "line-c",
  point: GeometryPointCoordinates,
): number {
  const object = lineObject(state, lineId);
  const start = pointById(state.points, object.startPointId);
  const vector = geometryObjectVector(state, object);
  if (!start || !vector) return Number.POSITIVE_INFINITY;
  const length = Math.hypot(vector.x, vector.y);
  if (length <= state.tolerance.absolute) return Number.POSITIVE_INFINITY;
  return Math.abs(geometryCross(vector, geometryVector(start, point))) / length;
}

function pointOnLine(
  state: GeometryLabState,
  lineId: "line-a" | "line-b" | "line-c",
  point: GeometryPointCoordinates,
): boolean {
  return lineDistance(state, lineId, point) <= state.tolerance.length;
}

function vectorsAngleDegrees(left: GeometryPointCoordinates, right: GeometryPointCoordinates): number {
  const divisor = Math.hypot(left.x, left.y) * Math.hypot(right.x, right.y);
  if (divisor <= 1e-9) return Number.NaN;
  const cosine = Math.min(1, Math.max(-1, Math.abs((left.x * right.x + left.y * right.y) / divisor)));
  return Math.acos(cosine) * 180 / Math.PI;
}

export function analyzeLineConstruction(state: GeometryLabState): LineConstructionAnalysis {
  const activity = getLineConstructionSeedConfig(Number(state.points.find((point) => point.id === "seed-marker")?.x ?? 411_101)).activity;
  const aVector = geometryObjectVector(state, lineObject(state, "line-a"))!;
  const bVector = geometryObjectVector(state, lineObject(state, "line-b"))!;
  const cVector = geometryObjectVector(state, lineObject(state, "line-c"))!;
  const target = pointById(state.points, "target-p")!;
  const tool = trySquarePose(state);
  const toolVector = {
    x: Math.cos(tool.angleDegrees * Math.PI / 180),
    y: Math.sin(tool.angleDegrees * Math.PI / 180),
  };
  const toolNormal = { x: -toolVector.y, y: toolVector.x };
  const toolBaseParallel = areParallelVectors(aVector, toolVector, { tolerance: state.tolerance });
  const toolOriginOnA = pointOnLine(state, "line-a", tool.origin);
  const targetVector = geometryVector(tool.origin, target);
  const toolEdgeThroughP = Math.abs(geometryCross(toolNormal, targetVector)) <= state.tolerance.length;
  const abParallel = areParallelVectors(aVector, bVector, { tolerance: state.tolerance });
  const abPerpendicular = arePerpendicularVectors(aVector, bVector, { tolerance: state.tolerance });
  const bcPerpendicular = arePerpendicularVectors(bVector, cVector, { tolerance: state.tolerance });
  const bThroughP = pointOnLine(state, "line-b", target);
  const cThroughP = pointOnLine(state, "line-c", target);

  let conditions: LineConstructionCondition[];
  const errors: GeometryFeedbackCode[] = [];
  if (activity === "perpendicular") {
    conditions = [
      { id: "tool-on-a", symbol: "▱∩a", label: "wierzchołek ekierki leży na prostej a", met: toolOriginOnA },
      { id: "tool-base-parallel", symbol: "▱ ∥ a", label: "jedna krawędź ekierki pokrywa kierunek a", met: toolBaseParallel },
      { id: "tool-through-p", symbol: "P∈▱", label: "druga krawędź ekierki przechodzi przez P", met: toolEdgeThroughP },
      { id: "a-perpendicular-b", symbol: "a ⟂ b", label: "narysowana prosta b jest prostopadła do a i przechodzi przez P", met: abPerpendicular && bThroughP },
    ];
    if (!toolBaseParallel || !abPerpendicular) errors.push(GEOMETRY_FEEDBACK_CODES.notPerpendicular);
  } else if (activity === "parallel") {
    conditions = [
      { id: "a-parallel-b", symbol: "a ∥ b", label: "kierunek b nie zmienił się podczas przesuwania", met: abParallel },
      { id: "b-through-p", symbol: "P ∈ b", label: "przesunięta prosta b przechodzi przez P", met: bThroughP },
      { id: "trace-visible", symbol: "↕ bez ↻", label: "konstrukcja jest przesunięciem bez obrotu", met: abParallel },
    ];
    if (!abParallel) errors.push(GEOMETRY_FEEDBACK_CODES.notParallel);
  } else {
    conditions = [
      { id: "network-parallel", symbol: "a ∥ b", label: "tory a i b są równoległe", met: abParallel },
      { id: "network-perpendicular", symbol: "b ⟂ c", label: "alejka c jest prostopadła do toru b", met: bcPerpendicular },
      { id: "network-point", symbol: "P ∈ c", label: "alejka c przechodzi przez punkt P", met: cThroughP },
    ];
    if (!abParallel) errors.push(GEOMETRY_FEEDBACK_CODES.notParallel);
    if (!bcPerpendicular) errors.push(GEOMETRY_FEEDBACK_CODES.notPerpendicular);
  }

  return {
    activity,
    complete: conditions.every((condition) => condition.met),
    conditions,
    errorCodes: errors,
    angleAB: vectorsAngleDegrees(aVector, bVector),
    angleBC: vectorsAngleDegrees(bVector, cVector),
  };
}

export function createLineConstructionGeometryState(
  seed: number,
  mode: GeometryLabMode = "practice",
): GeometryLabState {
  const config = getLineConstructionSeedConfig(seed);
  const referenceCenter = { x: 350, y: config.activity === "perpendicular" ? 300 : 255 };
  const [aStart, aEnd] = endpoints(referenceCenter, config.referenceAngle);
  const parallelCenter = config.activity === "parallel" ? { x: 260, y: 145 } : { x: 255, y: 165 };
  const parallelAngle = config.activity === "network" ? config.referenceAngle - 14 : config.referenceAngle;
  const [bStart, bEnd] = endpoints(parallelCenter, parallelAngle);
  const cCenter = config.activity === "network" ? { x: 430, y: 285 } : { x: 380, y: 210 };
  const [cStart, cEnd] = endpoints(cCenter, config.referenceAngle + 50);
  const target = config.activity === "perpendicular"
    ? { x: 500, y: 150 }
    : config.activity === "parallel"
      ? { x: 485, y: 175 }
      : { x: 505, y: 125 };
  const toolOrigin = config.activity === "perpendicular" ? { x: 235, y: 265 } : { x: 300, y: 280 };
  const toolAngle = config.referenceAngle + (config.activity === "perpendicular" ? 14 : 0);
  const toolRadians = toolAngle * Math.PI / 180;
  const toolBase = {
    x: toolOrigin.x + Math.cos(toolRadians) * TOOL_EDGE_LENGTH,
    y: toolOrigin.y + Math.sin(toolRadians) * TOOL_EDGE_LENGTH,
  };
  return {
    version: 1,
    mode,
    viewport: { width: 720, height: 460, padding: 28, scale: 1 },
    grid: { visible: true, step: 20, snap: false },
    tolerance: { absolute: 1e-7, angleDegrees: 0.75, length: 2 },
    points: [
      { id: "a-start", label: "A", ...aStart, locked: true },
      { id: "a-end", label: "B", ...aEnd, locked: true },
      { id: "b-start", label: "C", ...bStart },
      { id: "b-end", label: "D", ...bEnd },
      { id: "c-start", label: "E", ...cStart },
      { id: "c-end", label: "F", ...cEnd },
      { id: "target-p", label: "P", ...target, locked: true },
      { id: "tool-origin", label: "Q", ...toolOrigin },
      { id: "tool-base", label: "T", ...toolBase },
      { id: "trace-origin", label: "S", ...parallelCenter, locked: true },
      { id: "seed-marker", label: "seed", x: config.seed, y: 0, locked: true },
    ],
    objects: [
      { id: "line-a", kind: "line", startPointId: "a-start", endPointId: "a-end", label: "a" },
      { id: "line-b", kind: "line", startPointId: "b-start", endPointId: "b-end", label: "b" },
      { id: "line-c", kind: "line", startPointId: "c-start", endPointId: "c-end", label: "c" },
    ],
    angles: [],
    polygon: {
      id: "construction-placeholder",
      vertexIds: ["a-start", "a-end", "target-p"],
      closed: false,
      showSideLengths: false,
      showAngles: false,
      showClassification: false,
    },
    constraints: [],
    selectedPointId: "tool-origin",
    protractor: {
      visible: false,
      center: { x: 350, y: 230 },
      rotationDegrees: 0,
      radius: 110,
      scale: "inner",
    },
  };
}

export function lineDirectionChangeFromReference(state: GeometryLabState): number {
  return angleDifference(lineConstructionAngle(state, "line-a"), lineConstructionAngle(state, "line-b"));
}
