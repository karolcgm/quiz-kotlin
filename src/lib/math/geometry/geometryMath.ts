import { GEOMETRY_FEEDBACK_CODES } from "@/types/geometry";
import type {
  GeometryExactLength,
  GeometryIntersection,
  GeometryLabState,
  GeometryObject,
  GeometryPoint,
  GeometryPointCoordinates,
  GeometryPolygonAnalysis,
  GeometryTolerance,
} from "@/types/geometry";

const DEFAULT_EPSILON = 1e-9;

export function geometryVector(
  start: GeometryPointCoordinates,
  end: GeometryPointCoordinates,
): GeometryPointCoordinates {
  return { x: end.x - start.x, y: end.y - start.y };
}

export function geometryDot(
  left: GeometryPointCoordinates,
  right: GeometryPointCoordinates,
): number {
  return left.x * right.x + left.y * right.y;
}

export function geometryCross(
  left: GeometryPointCoordinates,
  right: GeometryPointCoordinates,
): number {
  return left.x * right.y - left.y * right.x;
}

export function squaredDistance(
  left: GeometryPointCoordinates,
  right: GeometryPointCoordinates,
): number {
  const vector = geometryVector(left, right);
  return geometryDot(vector, vector);
}

export function geometryDistance(
  left: GeometryPointCoordinates,
  right: GeometryPointCoordinates,
): number {
  return Math.sqrt(squaredDistance(left, right));
}

function greatestSquareFactor(value: number): number {
  if (!Number.isSafeInteger(value) || value <= 0) return 1;
  for (let candidate = Math.floor(Math.sqrt(value)); candidate >= 2; candidate -= 1) {
    if (value % (candidate * candidate) === 0) return candidate;
  }
  return 1;
}

/** Zachowuje kwadrat długości jako wartość dokładną; tekst dziesiętny jest tylko prezentacją. */
export function exactGeometryLength(
  left: GeometryPointCoordinates,
  right: GeometryPointCoordinates,
): GeometryExactLength {
  const squared = squaredDistance(left, right);
  const value = Math.sqrt(squared);
  if (Number.isSafeInteger(squared)) {
    const root = Math.sqrt(squared);
    if (Number.isInteger(root)) return { squared, value, exact: String(root) };
    const factor = greatestSquareFactor(squared);
    const remainder = squared / (factor * factor);
    return {
      squared,
      value,
      exact: factor === 1 ? `√${squared}` : `${factor}√${remainder}`,
    };
  }
  return { squared, value, exact: value.toPrecision(12).replace(/\.?0+$/u, "") };
}

function vectorLength(vector: GeometryPointCoordinates): number {
  return Math.hypot(vector.x, vector.y);
}

function normalizedDirectionDifferenceDegrees(
  left: GeometryPointCoordinates,
  right: GeometryPointCoordinates,
): number {
  const leftLength = vectorLength(left);
  const rightLength = vectorLength(right);
  if (leftLength <= DEFAULT_EPSILON || rightLength <= DEFAULT_EPSILON) return Number.POSITIVE_INFINITY;
  const cosine = Math.min(1, Math.max(-1, geometryDot(left, right) / (leftLength * rightLength)));
  const raw = Math.acos(cosine) * 180 / Math.PI;
  return Math.min(raw, Math.abs(180 - raw));
}

export function areParallelVectors(
  left: GeometryPointCoordinates,
  right: GeometryPointCoordinates,
  options: { exact?: boolean; tolerance?: GeometryTolerance } = {},
): boolean {
  if (vectorLength(left) <= DEFAULT_EPSILON || vectorLength(right) <= DEFAULT_EPSILON) return false;
  if (options.exact) return geometryCross(left, right) === 0;
  return normalizedDirectionDifferenceDegrees(left, right)
    <= (options.tolerance?.angleDegrees ?? 0.75);
}

export function arePerpendicularVectors(
  left: GeometryPointCoordinates,
  right: GeometryPointCoordinates,
  options: { exact?: boolean; tolerance?: GeometryTolerance } = {},
): boolean {
  const leftLength = vectorLength(left);
  const rightLength = vectorLength(right);
  if (leftLength <= DEFAULT_EPSILON || rightLength <= DEFAULT_EPSILON) return false;
  if (options.exact) return geometryDot(left, right) === 0;
  const cosine = Math.min(1, Math.max(-1, geometryDot(left, right) / (leftLength * rightLength)));
  const angle = Math.acos(cosine) * 180 / Math.PI;
  return Math.abs(90 - angle) <= (options.tolerance?.angleDegrees ?? 0.75);
}

/** Mniejszy kąt między ramionami, zawsze w zakresie 0–180°. */
export function angleBetweenPointsDegrees(
  start: GeometryPointCoordinates,
  vertex: GeometryPointCoordinates,
  end: GeometryPointCoordinates,
): number {
  const left = geometryVector(vertex, start);
  const right = geometryVector(vertex, end);
  const divisor = vectorLength(left) * vectorLength(right);
  if (divisor <= DEFAULT_EPSILON) return Number.NaN;
  const cosine = Math.min(1, Math.max(-1, geometryDot(left, right) / divisor));
  return Math.acos(cosine) * 180 / Math.PI;
}

/** Kierunek matematyczny (przeciwnie do wskazówek zegara), mimo rosnącego w dół y ekranu. */
export function directedMathAngleDegrees(
  start: GeometryPointCoordinates,
  vertex: GeometryPointCoordinates,
  end: GeometryPointCoordinates,
): number {
  const from = geometryVector(vertex, start);
  const to = geometryVector(vertex, end);
  const fromAngle = Math.atan2(-from.y, from.x);
  const toAngle = Math.atan2(-to.y, to.x);
  return ((toAngle - fromAngle) * 180 / Math.PI + 360) % 360;
}

export function pointById(points: GeometryPoint[], pointId: string): GeometryPoint | undefined {
  return points.find((point) => point.id === pointId);
}

export function polygonEdgeObjects(state: GeometryLabState): GeometryObject[] {
  const ids = state.polygon.vertexIds;
  if (ids.length < 2) return [];
  const edgeCount = state.polygon.closed ? ids.length : ids.length - 1;
  return Array.from({ length: edgeCount }, (_, index) => ({
    id: `${state.polygon.id}-edge-${index}`,
    kind: "segment" as const,
    startPointId: ids[index],
    endPointId: ids[(index + 1) % ids.length],
    label: `${pointById(state.points, ids[index])?.label ?? "?"}${pointById(state.points, ids[(index + 1) % ids.length])?.label ?? "?"}`,
    showLength: state.polygon.showSideLengths,
  }));
}

export function allGeometryObjects(state: GeometryLabState): GeometryObject[] {
  return [...state.objects, ...polygonEdgeObjects(state)];
}

export function geometryObjectVector(
  state: GeometryLabState,
  object: GeometryObject,
): GeometryPointCoordinates | null {
  const start = pointById(state.points, object.startPointId);
  const end = pointById(state.points, object.endPointId);
  return start && end ? geometryVector(start, end) : null;
}

interface ParametricPrimitive {
  id: string;
  point: GeometryPointCoordinates;
  vector: GeometryPointCoordinates;
  min: number;
  max: number;
}

function toParametric(
  object: GeometryObject,
  points: GeometryPoint[],
): ParametricPrimitive | null {
  const point = pointById(points, object.startPointId);
  const end = pointById(points, object.endPointId);
  if (!point || !end) return null;
  const vector = geometryVector(point, end);
  if (vectorLength(vector) <= DEFAULT_EPSILON) return null;
  if (object.kind === "line") return { id: object.id, point, vector, min: -Infinity, max: Infinity };
  if (object.kind === "ray") return { id: object.id, point, vector, min: 0, max: Infinity };
  return { id: object.id, point, vector, min: 0, max: 1 };
}

function parameterAllowed(value: number, primitive: ParametricPrimitive, epsilon: number): boolean {
  return value >= primitive.min - epsilon && value <= primitive.max + epsilon;
}

export function intersectGeometryObjects(
  first: GeometryObject,
  second: GeometryObject,
  points: GeometryPoint[],
  epsilon = DEFAULT_EPSILON,
): GeometryIntersection | null {
  const left = toParametric(first, points);
  const right = toParametric(second, points);
  if (!left || !right) return null;
  const difference = geometryVector(left.point, right.point);
  const divisor = geometryCross(left.vector, right.vector);
  if (Math.abs(divisor) <= epsilon) return null;
  const leftParameter = geometryCross(difference, right.vector) / divisor;
  const rightParameter = geometryCross(difference, left.vector) / divisor;
  if (!parameterAllowed(leftParameter, left, epsilon) || !parameterAllowed(rightParameter, right, epsilon)) {
    return null;
  }
  const point = {
    x: left.point.x + leftParameter * left.vector.x,
    y: left.point.y + leftParameter * left.vector.y,
  };
  const atEndpoint = [leftParameter, rightParameter].some(
    (value) => Math.abs(value) <= epsilon || Math.abs(value - 1) <= epsilon,
  );
  return {
    point,
    firstObjectId: first.id,
    secondObjectId: second.id,
    kind: atEndpoint ? "endpoint" : "proper",
  };
}

export function calculateGeometryIntersections(state: GeometryLabState): GeometryIntersection[] {
  const objects = allGeometryObjects(state);
  const intersections: GeometryIntersection[] = [];
  for (let firstIndex = 0; firstIndex < objects.length; firstIndex += 1) {
    for (let secondIndex = firstIndex + 1; secondIndex < objects.length; secondIndex += 1) {
      const first = objects[firstIndex];
      const second = objects[secondIndex];
      if (
        first.startPointId === second.startPointId ||
        first.startPointId === second.endPointId ||
        first.endPointId === second.startPointId ||
        first.endPointId === second.endPointId
      ) continue;
      const intersection = intersectGeometryObjects(first, second, state.points, state.tolerance.absolute);
      if (intersection) intersections.push(intersection);
    }
  }
  return intersections;
}

export function triangleSideLengthsAreValid(
  sides: readonly [number, number, number],
  epsilon = DEFAULT_EPSILON,
): boolean {
  if (sides.some((side) => !Number.isFinite(side) || side <= 0)) return false;
  const sorted = [...sides].sort((left, right) => left - right);
  return sorted[0] + sorted[1] > sorted[2] + epsilon;
}

function lengthsEqual(
  left: GeometryExactLength,
  right: GeometryExactLength,
  exact: boolean,
  tolerance: GeometryTolerance,
): boolean {
  return exact
    ? left.squared === right.squared
    : Math.abs(left.value - right.value) <= tolerance.length;
}

function classificationForTriangle(
  lengths: GeometryExactLength[],
  angles: number[],
  exact: boolean,
  tolerance: GeometryTolerance,
): string[] {
  const equal01 = lengthsEqual(lengths[0], lengths[1], exact, tolerance);
  const equal12 = lengthsEqual(lengths[1], lengths[2], exact, tolerance);
  const equal20 = lengthsEqual(lengths[2], lengths[0], exact, tolerance);
  const sideClass = equal01 && equal12
    ? "trójkąt równoboczny"
    : equal01 || equal12 || equal20
      ? "trójkąt równoramienny"
      : "trójkąt różnoboczny";
  const greatest = Math.max(...angles);
  const angleClass = Math.abs(greatest - 90) <= (exact ? DEFAULT_EPSILON : tolerance.angleDegrees)
    ? "trójkąt prostokątny"
    : greatest > 90
      ? "trójkąt rozwartokątny"
      : "trójkąt ostrokątny";
  return [sideClass, angleClass, "trójkąt"];
}

function classificationForQuadrilateral(
  points: GeometryPoint[],
  lengths: GeometryExactLength[],
  exact: boolean,
  tolerance: GeometryTolerance,
): string[] {
  const vectors = points.map((point, index) => geometryVector(point, points[(index + 1) % 4]));
  const parallel02 = areParallelVectors(vectors[0], vectors[2], { exact, tolerance });
  const parallel13 = areParallelVectors(vectors[1], vectors[3], { exact, tolerance });
  const allRight = vectors.every((vector, index) => (
    arePerpendicularVectors(vector, vectors[(index + 1) % 4], { exact, tolerance })
  ));
  const equal = lengths.map((length, index) => lengthsEqual(length, lengths[(index + 1) % 4], exact, tolerance));
  const allEqual = equal.every(Boolean);
  const oppositeEqual = lengthsEqual(lengths[0], lengths[2], exact, tolerance)
    && lengthsEqual(lengths[1], lengths[3], exact, tolerance);
  const adjacentPairs = (equal[0] && equal[2]) || (equal[1] && equal[3]);
  const classifications: string[] = [];
  if (allRight && allEqual) classifications.push("kwadrat");
  if (allRight) classifications.push("prostokąt");
  if (parallel02 && parallel13 && allEqual) classifications.push("romb");
  if (parallel02 && parallel13 && oppositeEqual) classifications.push("równoległobok");
  if (parallel02 || parallel13) classifications.push("trapez");
  if (adjacentPairs) classifications.push("deltoid");
  classifications.push("czworokąt");
  return Array.from(new Set(classifications));
}

const POLYGON_NAMES: Record<number, string> = {
  3: "trójkąt",
  4: "czworokąt",
  5: "pięciokąt",
  6: "sześciokąt",
  7: "siedmiokąt",
  8: "ośmiokąt",
};

export function analyzeGeometryPolygon(state: GeometryLabState): GeometryPolygonAnalysis {
  const points = state.polygon.vertexIds
    .map((pointId) => pointById(state.points, pointId))
    .filter((point): point is GeometryPoint => Boolean(point));
  const vertexCount = points.length;
  const exact = state.grid.snap;
  const duplicateIds = new Set<string>();
  points.forEach((point, index) => {
    points.slice(index + 1).forEach((candidate) => {
      if (squaredDistance(point, candidate) <= state.tolerance.absolute ** 2) {
        duplicateIds.add(point.id);
        duplicateIds.add(candidate.id);
      }
    });
  });
  const duplicatePointIds = [...duplicateIds];
  const signedAreaTwice = points.reduce((sum, point, index) => {
    const next = points[(index + 1) % Math.max(1, points.length)] ?? point;
    return sum + point.x * next.y - next.x * point.y;
  }, 0);
  const sideLengths = points.map((point, index) => exactGeometryLength(point, points[(index + 1) % points.length] ?? point));
  const angleDegrees = points.map((point, index) => {
    const previous = points[(index - 1 + points.length) % points.length] ?? point;
    const next = points[(index + 1) % points.length] ?? point;
    const minor = angleBetweenPointsDegrees(previous, point, next);
    const turn = geometryCross(geometryVector(point, previous), geometryVector(point, next));
    const concave = signedAreaTwice > state.tolerance.absolute
      ? turn > state.tolerance.absolute
      : signedAreaTwice < -state.tolerance.absolute && turn < -state.tolerance.absolute;
    return concave && Number.isFinite(minor) ? 360 - minor : minor;
  });
  const polygonEdges = polygonEdgeObjects(state);
  const intersections: GeometryIntersection[] = [];
  for (let firstIndex = 0; firstIndex < polygonEdges.length; firstIndex += 1) {
    for (let secondIndex = firstIndex + 1; secondIndex < polygonEdges.length; secondIndex += 1) {
      const adjacent = Math.abs(firstIndex - secondIndex) <= 1
        || (firstIndex === 0 && secondIndex === polygonEdges.length - 1);
      if (adjacent) continue;
      const intersection = intersectGeometryObjects(
        polygonEdges[firstIndex],
        polygonEdges[secondIndex],
        state.points,
        state.tolerance.absolute,
      );
      if (intersection) intersections.push(intersection);
    }
  }
  const firstPoint = points[0];
  const baselineEnd = points.find((point) => firstPoint && squaredDistance(firstPoint, point) > state.tolerance.absolute ** 2);
  const baseline = firstPoint && baselineEnd ? geometryVector(firstPoint, baselineEnd) : null;
  const allCollinear = !baseline || points.every((point) => (
    Math.abs(geometryCross(baseline, geometryVector(firstPoint, point))) <= state.tolerance.absolute
  ));
  const degenerate = vertexCount < 3
    || duplicatePointIds.length > 0
    || allCollinear
    || sideLengths.some((length) => length.value <= state.tolerance.absolute)
    || angleDegrees.some((angle) => !Number.isFinite(angle));
  const selfIntersecting = intersections.length > 0;
  const errorCodes = [
    ...(degenerate ? [GEOMETRY_FEEDBACK_CODES.degenerate] : []),
    ...(selfIntersecting ? [GEOMETRY_FEEDBACK_CODES.selfIntersection] : []),
  ];
  let classification: string[] = [];
  if (!degenerate && !selfIntersecting) {
    if (vertexCount === 3) classification = classificationForTriangle(sideLengths, angleDegrees, exact, state.tolerance);
    else if (vertexCount === 4) classification = classificationForQuadrilateral(points, sideLengths, exact, state.tolerance);
    else classification = [POLYGON_NAMES[vertexCount] ?? `${vertexCount}-kąt`];
  }
  return {
    status: errorCodes.length > 0 ? "invalid" : "valid",
    vertexCount,
    signedAreaTwice,
    orientation: Math.abs(signedAreaTwice) <= state.tolerance.absolute
      ? "degenerate"
      : signedAreaTwice > 0 ? "clockwise" : "counterclockwise",
    sideLengths,
    angleDegrees,
    intersections,
    duplicatePointIds,
    classification,
    primaryClassification: classification[0] ?? "figura niepoprawna",
    errorCodes,
  };
}

export function reflectPointAcrossAxis(
  point: GeometryPointCoordinates,
  axis: { anchor: GeometryPointCoordinates; direction: GeometryPointCoordinates },
): GeometryPointCoordinates {
  const directionLengthSquared = geometryDot(axis.direction, axis.direction);
  if (directionLengthSquared <= DEFAULT_EPSILON) return { ...point };
  const relative = geometryVector(axis.anchor, point);
  const factor = geometryDot(relative, axis.direction) / directionLengthSquared;
  const projection = {
    x: axis.anchor.x + factor * axis.direction.x,
    y: axis.anchor.y + factor * axis.direction.y,
  };
  return { x: 2 * projection.x - point.x, y: 2 * projection.y - point.y };
}

export function isPointSetSymmetricAcrossAxis(
  points: GeometryPointCoordinates[],
  axis: { anchor: GeometryPointCoordinates; direction: GeometryPointCoordinates },
  tolerance = DEFAULT_EPSILON,
): boolean {
  return points.every((point) => {
    const reflected = reflectPointAcrossAxis(point, axis);
    return points.some((candidate) => squaredDistance(candidate, reflected) <= tolerance ** 2);
  });
}
