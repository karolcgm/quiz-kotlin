import {
  allGeometryObjects,
  areParallelVectors,
  arePerpendicularVectors,
  exactGeometryLength,
  geometryDot,
  geometryObjectVector,
  geometryVector,
  pointById,
  reflectPointAcrossAxis,
} from "@/lib/math/geometry/geometryMath";
import { GEOMETRY_FEEDBACK_CODES } from "@/types/geometry";
import type {
  GeometryConstraint,
  GeometryFeedbackCode,
  GeometryHistoryState,
  GeometryLabMode,
  GeometryLabState,
  GeometryObject,
  GeometryPoint,
  GeometryPointCoordinates,
  GeometryPrintSnapshot,
} from "@/types/geometry";

function cloneState(state: GeometryLabState): GeometryLabState {
  return JSON.parse(JSON.stringify(state)) as GeometryLabState;
}

function regularPolygonPoints(count: number, rotationDegrees = -90): GeometryPoint[] {
  const center = { x: 320, y: 205 };
  const radius = count <= 4 ? 125 : 145;
  return Array.from({ length: count }, (_, index) => {
    const angle = (rotationDegrees + index * 360 / count) * Math.PI / 180;
    return {
      id: `vertex-${index + 1}`,
      label: String.fromCharCode(65 + index),
      x: Math.round(center.x + Math.cos(angle) * radius),
      y: Math.round(center.y + Math.sin(angle) * radius),
    };
  });
}

export function createDefaultGeometryState(
  options: { mode?: GeometryLabMode; vertexCount?: number; seed?: number } = {},
): GeometryLabState {
  const vertexCount = Math.max(3, Math.min(8, Math.trunc(options.vertexCount ?? 4)));
  const seed = Number.isFinite(options.seed) ? Math.trunc(options.seed ?? 1) : 1;
  const rotation = -90 + ((seed % 12) + 12) % 12 * 15;
  const points = regularPolygonPoints(vertexCount, rotation);
  return {
    version: 1,
    mode: options.mode ?? "practice",
    viewport: { width: 640, height: 420, padding: 28, scale: 1 },
    grid: { visible: true, step: 20, snap: true },
    tolerance: { absolute: 1e-7, angleDegrees: 0.75, length: 0.5 },
    points,
    objects: [],
    angles: vertexCount >= 3 ? [{
      id: "angle-main",
      startPointId: points[0].id,
      vertexPointId: points[1].id,
      endPointId: points[2].id,
      label: `∠${points[0].label}${points[1].label}${points[2].label}`,
      showArc: true,
      showMeasure: true,
    }] : [],
    polygon: {
      id: "polygon-main",
      vertexIds: points.map((point) => point.id),
      closed: true,
      showSideLengths: true,
      showAngles: true,
      showClassification: true,
    },
    constraints: [],
    selectedPointId: points[0]?.id ?? null,
    protractor: {
      visible: false,
      center: { x: 320, y: 205 },
      rotationDegrees: 0,
      radius: 115,
      scale: "inner",
    },
  };
}

export function resizeGeometryPolygon(state: GeometryLabState, requestedCount: number): GeometryLabState {
  const count = Math.max(3, Math.min(8, Math.trunc(requestedCount)));
  if (count === state.polygon.vertexIds.length) return cloneState(state);
  const oldVertexIds = new Set(state.polygon.vertexIds);
  const preservedPoints = state.points.filter((point) => !oldVertexIds.has(point.id));
  const polygonPoints = regularPolygonPoints(count);
  const polygonIds = polygonPoints.map((point) => point.id);
  return {
    ...cloneState(state),
    points: [...preservedPoints, ...polygonPoints],
    polygon: { ...state.polygon, vertexIds: polygonIds },
    angles: [{
      id: "angle-main",
      startPointId: polygonIds[0],
      vertexPointId: polygonIds[1],
      endPointId: polygonIds[2],
      label: "∠ABC",
      showArc: true,
      showMeasure: true,
    }],
    constraints: [],
    selectedPointId: polygonIds[0],
  };
}

export function snapGeometryCoordinate(value: number, step: number): number {
  if (!Number.isFinite(value)) return 0;
  if (!Number.isFinite(step) || step <= 0) return value;
  return Math.round(value / step) * step;
}

function clampPoint(state: GeometryLabState, point: GeometryPointCoordinates): GeometryPointCoordinates {
  const { padding, width, height } = state.viewport;
  const candidate = state.grid.snap ? {
    x: snapGeometryCoordinate(point.x, state.grid.step),
    y: snapGeometryCoordinate(point.y, state.grid.step),
  } : point;
  return {
    x: Math.max(padding, Math.min(width - padding, candidate.x)),
    y: Math.max(padding, Math.min(height - padding, candidate.y)),
  };
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

function objectById(state: GeometryLabState, objectId: string): GeometryObject | undefined {
  return allGeometryObjects(state).find((object) => object.id === objectId);
}

function constrainObjectEndpoint(
  state: GeometryLabState,
  movedPointId: string,
  object: GeometryObject,
  direction: GeometryPointCoordinates,
  forcedLength?: number,
): GeometryLabState {
  if (object.startPointId !== movedPointId && object.endPointId !== movedPointId) return state;
  const otherId = object.startPointId === movedPointId ? object.endPointId : object.startPointId;
  const moved = pointById(state.points, movedPointId);
  const other = pointById(state.points, otherId);
  if (!moved || !other) return state;
  const directionLength = Math.hypot(direction.x, direction.y);
  if (directionLength <= state.tolerance.absolute) return state;
  const currentVector = geometryVector(other, moved);
  const sign = geometryDot(currentVector, direction) < 0 ? -1 : 1;
  const length = forcedLength ?? Math.max(state.tolerance.absolute, Math.hypot(currentVector.x, currentVector.y));
  const candidate = {
    x: other.x + sign * direction.x / directionLength * length,
    y: other.y + sign * direction.y / directionLength * length,
  };
  return replacePoint(state, movedPointId, clampPoint({ ...state, grid: { ...state.grid, snap: false } }, candidate));
}

function applyVectorConstraint(
  state: GeometryLabState,
  movedPointId: string,
  constraint: Extract<GeometryConstraint, { kind: "parallel" | "perpendicular" }>,
): GeometryLabState {
  const reference = objectById(state, constraint.referenceObjectId);
  if (!reference) return state;
  const referenceVector = geometryObjectVector(state, reference);
  if (!referenceVector) return state;
  const referenceMoved = reference.startPointId === movedPointId || reference.endPointId === movedPointId;
  const targetDirection = constraint.kind === "parallel"
    ? referenceVector
    : { x: -referenceVector.y, y: referenceVector.x };
  return constraint.targetObjectIds.reduce((current, objectId) => {
    const object = objectById(current, objectId);
    if (!object) return current;
    const endpointToMove = object.startPointId === movedPointId || object.endPointId === movedPointId
      ? movedPointId
      : referenceMoved ? object.endPointId : movedPointId;
    return constrainObjectEndpoint(current, endpointToMove, object, targetDirection);
  }, state);
}

function applyEqualLengthConstraint(
  state: GeometryLabState,
  movedPointId: string,
  constraint: Extract<GeometryConstraint, { kind: "equal-length" }>,
): GeometryLabState {
  const reference = objectById(state, constraint.referenceObjectId);
  if (!reference) return state;
  const referenceStart = pointById(state.points, reference.startPointId);
  const referenceEnd = pointById(state.points, reference.endPointId);
  if (!referenceStart || !referenceEnd) return state;
  const referenceLength = exactGeometryLength(referenceStart, referenceEnd).value;
  const referenceMoved = reference.startPointId === movedPointId || reference.endPointId === movedPointId;
  return constraint.targetObjectIds.reduce((current, objectId) => {
    const object = objectById(current, objectId);
    const vector = object ? geometryObjectVector(current, object) : null;
    const endpointToMove = object && (object.startPointId === movedPointId || object.endPointId === movedPointId)
      ? movedPointId
      : object && referenceMoved ? object.endPointId : movedPointId;
    return object && vector
      ? constrainObjectEndpoint(current, endpointToMove, object, vector, referenceLength)
      : current;
  }, state);
}

function applyRadiusConstraint(
  state: GeometryLabState,
  movedPointId: string,
  constraint: Extract<GeometryConstraint, { kind: "fixed-radius" }>,
): GeometryLabState {
  const center = pointById(state.points, constraint.centerPointId);
  if (!center || constraint.radius <= 0) return state;
  const affectedPointIds = constraint.pointIds.includes(movedPointId)
    ? [movedPointId]
    : movedPointId === constraint.centerPointId ? constraint.pointIds : [];
  return affectedPointIds.reduce((current, pointId) => {
    const currentCenter = pointById(current.points, constraint.centerPointId);
    const point = pointById(current.points, pointId);
    if (!currentCenter || !point) return current;
    const vector = geometryVector(currentCenter, point);
    const length = Math.hypot(vector.x, vector.y);
    const direction = length <= current.tolerance.absolute ? { x: 1, y: 0 } : vector;
    const directionLength = Math.hypot(direction.x, direction.y);
    return replacePoint(current, pointId, {
      x: currentCenter.x + direction.x / directionLength * constraint.radius,
      y: currentCenter.y + direction.y / directionLength * constraint.radius,
    });
  }, state);
}

function applySymmetryConstraint(
  state: GeometryLabState,
  movedPointId: string,
  constraint: Extract<GeometryConstraint, { kind: "symmetry" }>,
): GeometryLabState {
  const pair = constraint.pointPairs.find(([first, second]) => first === movedPointId || second === movedPointId);
  if (!pair) return state;
  const counterpartId = pair[0] === movedPointId ? pair[1] : pair[0];
  const moved = pointById(state.points, movedPointId);
  if (!moved) return state;
  const counterpart = reflectPointAcrossAxis(moved, constraint.axis);
  return replacePoint(state, counterpartId, clampPoint({ ...state, grid: { ...state.grid, snap: false } }, counterpart));
}

export function applyGeometryConstraints(state: GeometryLabState, movedPointId: string): GeometryLabState {
  return state.constraints.reduce((current, constraint) => {
    if (constraint.kind === "parallel" || constraint.kind === "perpendicular") {
      return applyVectorConstraint(current, movedPointId, constraint);
    }
    if (constraint.kind === "equal-length") {
      return applyEqualLengthConstraint(current, movedPointId, constraint);
    }
    if (constraint.kind === "fixed-radius") {
      return applyRadiusConstraint(current, movedPointId, constraint);
    }
    return applySymmetryConstraint(current, movedPointId, constraint);
  }, state);
}

export function moveGeometryPoint(
  state: GeometryLabState,
  pointId: string,
  coordinates: GeometryPointCoordinates,
): GeometryLabState {
  const point = pointById(state.points, pointId);
  if (!point || point.locked) return state;
  const moved = replacePoint(cloneState(state), pointId, clampPoint(state, coordinates));
  return applyGeometryConstraints({ ...moved, selectedPointId: pointId }, pointId);
}

export function geometryConstraintViolations(state: GeometryLabState): GeometryFeedbackCode[] {
  const exact = state.grid.snap;
  const violations = new Set<GeometryFeedbackCode>();
  for (const constraint of state.constraints) {
    if (constraint.kind !== "parallel" && constraint.kind !== "perpendicular") continue;
    const reference = objectById(state, constraint.referenceObjectId);
    const referenceVector = reference ? geometryObjectVector(state, reference) : null;
    if (!referenceVector) continue;
    for (const targetId of constraint.targetObjectIds) {
      const target = objectById(state, targetId);
      const targetVector = target ? geometryObjectVector(state, target) : null;
      if (!targetVector) continue;
      if (
        constraint.kind === "parallel" &&
        !areParallelVectors(referenceVector, targetVector, { exact, tolerance: state.tolerance })
      ) violations.add(GEOMETRY_FEEDBACK_CODES.notParallel);
      if (
        constraint.kind === "perpendicular" &&
        !arePerpendicularVectors(referenceVector, targetVector, { exact, tolerance: state.tolerance })
      ) violations.add(GEOMETRY_FEEDBACK_CODES.notPerpendicular);
    }
  }
  return [...violations];
}

export function createGeometryHistory(initial: GeometryLabState): GeometryHistoryState {
  const snapshot = cloneState(initial);
  return { initial: snapshot, past: [], present: cloneState(snapshot), future: [] };
}

export function commitGeometryHistory(
  history: GeometryHistoryState,
  next: GeometryLabState,
): GeometryHistoryState {
  if (serializeGeometryState(history.present) === serializeGeometryState(next)) return history;
  return {
    ...history,
    past: [...history.past, cloneState(history.present)].slice(-100),
    present: cloneState(next),
    future: [],
  };
}

export function undoGeometryHistory(history: GeometryHistoryState): GeometryHistoryState {
  const previous = history.past.at(-1);
  if (!previous) return history;
  return {
    ...history,
    past: history.past.slice(0, -1),
    present: cloneState(previous),
    future: [cloneState(history.present), ...history.future],
  };
}

export function redoGeometryHistory(history: GeometryHistoryState): GeometryHistoryState {
  const next = history.future[0];
  if (!next) return history;
  return {
    ...history,
    past: [...history.past, cloneState(history.present)],
    present: cloneState(next),
    future: history.future.slice(1),
  };
}

export function resetGeometryHistory(history: GeometryHistoryState): GeometryHistoryState {
  return {
    ...history,
    past: [...history.past, cloneState(history.present)].slice(-100),
    present: cloneState(history.initial),
    future: [],
  };
}

function assertGeometryState(input: unknown): asserts input is GeometryLabState {
  if (!input || typeof input !== "object") throw new Error("Stan geometrii musi być obiektem.");
  const state = input as Partial<GeometryLabState>;
  if (state.version !== 1) throw new Error("Nieobsługiwana wersja stanu geometrii.");
  if (!state.viewport || !state.grid || !state.tolerance || !state.protractor) {
    throw new Error("Stan geometrii nie zawiera pełnej konfiguracji modelu.");
  }
  if (!Array.isArray(state.points) || !Array.isArray(state.objects) || !Array.isArray(state.angles)
    || !Array.isArray(state.constraints) || !state.polygon) {
    throw new Error("Stan geometrii ma niepoprawną strukturę kolekcji.");
  }
  const finiteValues = [
    state.viewport.width, state.viewport.height, state.viewport.padding, state.viewport.scale,
    state.grid.step, state.tolerance.absolute, state.tolerance.angleDegrees, state.tolerance.length,
    state.protractor.center.x, state.protractor.center.y, state.protractor.rotationDegrees, state.protractor.radius,
    ...state.points.flatMap((point) => [point.x, point.y]),
  ];
  if (!finiteValues.every((value) => typeof value === "number" && Number.isFinite(value))) {
    throw new Error("Współrzędne i parametry geometrii muszą być liczbami skończonymi.");
  }
  if (state.grid.step <= 0 || state.viewport.width <= 0 || state.viewport.height <= 0 || state.viewport.scale <= 0) {
    throw new Error("Krok siatki i wymiary widoku muszą być dodatnie.");
  }
  if (state.polygon.vertexIds.length < 3 || state.polygon.vertexIds.length > 8) {
    throw new Error("Edytor wielokąta obsługuje od 3 do 8 wierzchołków.");
  }
  const pointIds = new Set(state.points.map((point) => point.id));
  if (pointIds.size !== state.points.length || state.points.some((point) => !point.id || !point.label)) {
    throw new Error("Punkty muszą mieć unikalne identyfikatory i etykiety.");
  }
  if (state.polygon.vertexIds.some((pointId) => !pointIds.has(pointId))) {
    throw new Error("Wielokąt odwołuje się do nieistniejącego punktu.");
  }
  if (state.objects.some((object) => !pointIds.has(object.startPointId) || !pointIds.has(object.endPointId))) {
    throw new Error("Obiekt geometryczny odwołuje się do nieistniejącego punktu.");
  }
}

export function serializeGeometryState(state: GeometryLabState): string {
  assertGeometryState(state);
  return JSON.stringify(state);
}

export function deserializeGeometryState(serialized: string): GeometryLabState {
  const parsed: unknown = JSON.parse(serialized);
  assertGeometryState(parsed);
  return cloneState(parsed);
}

export function createGeometryPrintSnapshot(
  state: GeometryLabState,
  options: { title?: string; description?: string } = {},
): GeometryPrintSnapshot {
  const printableState = cloneState({ ...state, selectedPointId: null });
  return {
    version: 1,
    createdFrom: "geometry-lab",
    state: printableState,
    includeHandles: false,
    title: options.title ?? "Model geometryczny",
    description: options.description ?? "Bieżący model przygotowany do wydruku bez interaktywnych uchwytów.",
  };
}

export function addGeometryObject(state: GeometryLabState, object: GeometryObject): GeometryLabState {
  const pointIds = new Set(state.points.map((point) => point.id));
  if (!pointIds.has(object.startPointId) || !pointIds.has(object.endPointId)) {
    throw new Error("Końce obiektu geometrycznego muszą wskazywać istniejące punkty.");
  }
  if (state.objects.some((candidate) => candidate.id === object.id)) {
    throw new Error(`Obiekt ${object.id} już istnieje.`);
  }
  return { ...cloneState(state), objects: [...state.objects, { ...object }] };
}
