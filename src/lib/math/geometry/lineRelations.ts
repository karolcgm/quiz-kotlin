import {
  areParallelVectors,
  arePerpendicularVectors,
  geometryCross,
  geometryObjectVector,
  geometryVector,
  intersectGeometryObjects,
  pointById,
} from "@/lib/math/geometry/geometryMath";
import type {
  GeometryIntersection,
  GeometryLabMode,
  GeometryLabState,
  GeometryObject,
  GeometryPointCoordinates,
} from "@/types/geometry";

export type LineRelationKind = "parallel" | "perpendicular" | "intersecting" | "collinear";
export type LineRelationDifficulty = "support" | "core" | "challenge";
export type LineRelationOrientation = "horizontal" | "vertical" | "diagonal";

export const LINE_RELATION_LESSON_SEEDS = {
  support: 410_101,
  core: 410_201,
  challenge: 410_301,
} as const satisfies Record<LineRelationDifficulty, number>;

export const LINE_RELATION_LABELS: Record<LineRelationKind, { label: string; symbol: string; notation: string }> = {
  parallel: { label: "równoległe", symbol: "∥", notation: "a ∥ b" },
  perpendicular: { label: "prostopadłe", symbol: "⟂", notation: "a ⟂ b" },
  intersecting: { label: "przecinające", symbol: "×", notation: "a × b" },
  collinear: { label: "współliniowe", symbol: "≡", notation: "a ≡ b" },
};

const LINE_LENGTH = 250;

function normalizeDirection(degrees: number): number {
  return ((degrees % 180) + 180) % 180;
}

function lineEndpoints(
  center: GeometryPointCoordinates,
  angleDegrees: number,
  length = LINE_LENGTH,
): [GeometryPointCoordinates, GeometryPointCoordinates] {
  const radians = angleDegrees * Math.PI / 180;
  const half = length / 2;
  const offset = { x: Math.cos(radians) * half, y: Math.sin(radians) * half };
  return [
    { x: center.x - offset.x, y: center.y - offset.y },
    { x: center.x + offset.x, y: center.y + offset.y },
  ];
}

function difficultyForSeed(seed: number): LineRelationDifficulty {
  const local = Math.abs(Math.trunc(seed)) % 1_000;
  if (local >= 300) return "challenge";
  if (local >= 200) return "core";
  return "support";
}

export function isLineRelationLessonSeed(seed: number): boolean {
  const value = Math.abs(Math.trunc(seed));
  return value >= 410_100 && value <= 410_399;
}

export function getLineRelationSeedConfig(seed: number): {
  seed: number;
  difficulty: LineRelationDifficulty;
  orientation: LineRelationOrientation;
  initialRelation: LineRelationKind;
} {
  const normalizedSeed = Number.isFinite(seed) ? Math.abs(Math.trunc(seed)) : LINE_RELATION_LESSON_SEEDS.support;
  const difficulty = difficultyForSeed(normalizedSeed);
  if (difficulty === "challenge") {
    return { seed: normalizedSeed, difficulty, orientation: "diagonal", initialRelation: "collinear" };
  }
  if (difficulty === "core") {
    return { seed: normalizedSeed, difficulty, orientation: "diagonal", initialRelation: "perpendicular" };
  }
  return { seed: normalizedSeed, difficulty, orientation: "horizontal", initialRelation: "parallel" };
}

function angleForOrientation(orientation: LineRelationOrientation): number {
  if (orientation === "vertical") return 90;
  if (orientation === "diagonal") return 35;
  return 0;
}

function centersForRelation(
  relation: LineRelationKind,
  referenceAngle: number,
): { reference: GeometryPointCoordinates; movable: GeometryPointCoordinates; movableAngle: number } {
  const reference = { x: 320, y: 210 };
  const radians = referenceAngle * Math.PI / 180;
  const direction = { x: Math.cos(radians), y: Math.sin(radians) };
  const normal = { x: -direction.y, y: direction.x };

  if (relation === "parallel") {
    return {
      reference,
      movable: { x: reference.x + normal.x * 125, y: reference.y + normal.y * 125 },
      movableAngle: referenceAngle,
    };
  }
  if (relation === "collinear") {
    return {
      reference,
      movable: { x: reference.x + direction.x * 55, y: reference.y + direction.y * 55 },
      movableAngle: referenceAngle,
    };
  }
  if (relation === "perpendicular") {
    return { reference, movable: reference, movableAngle: referenceAngle + 90 };
  }
  return { reference, movable: reference, movableAngle: referenceAngle + 48 };
}

export function configureLineRelationPreset(
  state: GeometryLabState,
  orientation: LineRelationOrientation,
  relation: LineRelationKind,
): GeometryLabState {
  const referenceAngle = angleForOrientation(orientation);
  const centers = centersForRelation(relation, referenceAngle);
  const [aStart, aEnd] = lineEndpoints(centers.reference, referenceAngle);
  const [bStart, bEnd] = lineEndpoints(centers.movable, centers.movableAngle);
  const coordinates = new Map<string, GeometryPointCoordinates>([
    ["line-a-start", aStart],
    ["line-a-end", aEnd],
    ["line-b-start", bStart],
    ["line-b-end", bEnd],
  ]);
  return {
    ...state,
    points: state.points.map((point) => ({ ...point, ...(coordinates.get(point.id) ?? {}) })),
    selectedPointId: "line-b-end",
  };
}

export function createLineRelationGeometryState(
  seed: number,
  mode: GeometryLabMode = "practice",
): GeometryLabState {
  const config = getLineRelationSeedConfig(seed);
  const base: GeometryLabState = {
    version: 1,
    mode,
    viewport: { width: 640, height: 420, padding: 28, scale: 1 },
    grid: { visible: true, step: 20, snap: false },
    tolerance: { absolute: 1e-7, angleDegrees: 0.75, length: 0.5 },
    points: [
      { id: "line-a-start", label: "A", x: 0, y: 0, locked: true },
      { id: "line-a-end", label: "B", x: 0, y: 0, locked: true },
      { id: "line-b-start", label: "C", x: 0, y: 0 },
      { id: "line-b-end", label: "D", x: 0, y: 0 },
    ],
    objects: [
      { id: "line-a", kind: "line", startPointId: "line-a-start", endPointId: "line-a-end", label: "a" },
      { id: "line-b", kind: "line", startPointId: "line-b-start", endPointId: "line-b-end", label: "b" },
    ],
    angles: [],
    polygon: {
      id: "line-relation-placeholder",
      vertexIds: ["line-a-start", "line-a-end", "line-b-start"],
      closed: false,
      showSideLengths: false,
      showAngles: false,
      showClassification: false,
    },
    constraints: [],
    selectedPointId: "line-b-end",
    protractor: {
      visible: false,
      center: { x: 320, y: 210 },
      rotationDegrees: 0,
      radius: 110,
      scale: "inner",
    },
  };
  return configureLineRelationPreset(base, config.orientation, config.initialRelation);
}

function lineObject(state: GeometryLabState, id: "line-a" | "line-b"): GeometryObject {
  const object = state.objects.find((candidate) => candidate.id === id);
  if (!object) throw new Error(`Brak prostej ${id} w konfiguracji Miasta linii.`);
  return object;
}

function lineCenter(state: GeometryLabState, object: GeometryObject): GeometryPointCoordinates {
  const start = pointById(state.points, object.startPointId);
  const end = pointById(state.points, object.endPointId);
  if (!start || !end) throw new Error(`Prosta ${object.id} ma niepełne końce.`);
  return { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 };
}

export function movableLineCenter(state: GeometryLabState): GeometryPointCoordinates {
  return lineCenter(state, lineObject(state, "line-b"));
}

export function lineDirectionDegrees(state: GeometryLabState, objectId: "line-a" | "line-b"): number {
  const vector = geometryObjectVector(state, lineObject(state, objectId));
  if (!vector) return Number.NaN;
  return normalizeDirection(Math.atan2(vector.y, vector.x) * 180 / Math.PI);
}

export function setMovableLinePosition(
  state: GeometryLabState,
  center: GeometryPointCoordinates,
  angleDegrees: number,
): GeometryLabState {
  const [start, end] = lineEndpoints(center, angleDegrees);
  return {
    ...state,
    points: state.points.map((point) => {
      if (point.id === "line-b-start") return { ...point, ...start };
      if (point.id === "line-b-end") return { ...point, ...end };
      return point;
    }),
  };
}

export function translateMovableLine(
  state: GeometryLabState,
  dx: number,
  dy: number,
): GeometryLabState {
  const center = movableLineCenter(state);
  return setMovableLinePosition(
    state,
    { x: center.x + dx, y: center.y + dy },
    lineDirectionDegrees(state, "line-b"),
  );
}

export function rotateMovableLine(state: GeometryLabState, angleDegrees: number): GeometryLabState {
  return setMovableLinePosition(state, movableLineCenter(state), angleDegrees);
}

export interface LineRelationAnalysis {
  kind: LineRelationKind;
  angleDegrees: number;
  intersection: GeometryIntersection | null;
}

export function classifyLineRelation(state: GeometryLabState): LineRelationAnalysis {
  const first = lineObject(state, "line-a");
  const second = lineObject(state, "line-b");
  const firstVector = geometryObjectVector(state, first);
  const secondVector = geometryObjectVector(state, second);
  const firstStart = pointById(state.points, first.startPointId);
  const secondStart = pointById(state.points, second.startPointId);
  if (!firstVector || !secondVector || !firstStart || !secondStart) {
    throw new Error("Nie można sklasyfikować niepełnej pary prostych.");
  }

  const firstLength = Math.hypot(firstVector.x, firstVector.y);
  const secondLength = Math.hypot(secondVector.x, secondVector.y);
  const cosine = Math.min(1, Math.max(-1,
    Math.abs((firstVector.x * secondVector.x + firstVector.y * secondVector.y) / (firstLength * secondLength)),
  ));
  const angleDegrees = Math.acos(cosine) * 180 / Math.PI;
  const parallel = areParallelVectors(firstVector, secondVector, { tolerance: state.tolerance });
  if (parallel) {
    const offset = geometryVector(firstStart, secondStart);
    const distance = Math.abs(geometryCross(firstVector, offset)) / firstLength;
    return { kind: distance <= state.tolerance.length ? "collinear" : "parallel", angleDegrees: 0, intersection: null };
  }

  const intersection = intersectGeometryObjects(first, second, state.points, state.tolerance.absolute);
  if (arePerpendicularVectors(firstVector, secondVector, { tolerance: state.tolerance })) {
    return { kind: "perpendicular", angleDegrees: 90, intersection };
  }
  return { kind: "intersecting", angleDegrees, intersection };
}
