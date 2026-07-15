import type { KeyboardEvent, PointerEvent } from "react";
import {
  allGeometryObjects,
  analyzeGeometryPolygon,
  angleBetweenPointsDegrees,
  calculateGeometryIntersections,
  exactGeometryLength,
  geometryCross,
  geometryVector,
  pointById,
  polygonEdgeObjects,
} from "@/lib/math/geometry";
import type { GeometryLabState, GeometryObject, GeometryPointCoordinates } from "@/types/geometry";

interface GeometrySceneProps {
  state: GeometryLabState;
  showHandles: boolean;
  highContrast?: boolean;
  theme?: "plain" | "playground";
  onPointPointerDown?: (pointId: string, event: PointerEvent<SVGCircleElement>) => void;
  onPointPointerMove?: (pointId: string, event: PointerEvent<SVGCircleElement>) => void;
  onPointPointerUp?: (pointId: string, event: PointerEvent<SVGCircleElement>) => void;
  onPointKeyDown?: (pointId: string, event: KeyboardEvent<SVGCircleElement>) => void;
  onPointSelect?: (pointId: string) => void;
}

function clampLabel(value: number, maximum: number): number {
  return Math.max(14, Math.min(maximum - 14, value));
}

function extendedObjectEndpoints(
  state: GeometryLabState,
  object: GeometryObject,
): { start: GeometryPointCoordinates; end: GeometryPointCoordinates } | null {
  const start = pointById(state.points, object.startPointId);
  const end = pointById(state.points, object.endPointId);
  if (!start || !end) return null;
  if (object.kind === "segment") return { start, end };
  const vector = geometryVector(start, end);
  const length = Math.hypot(vector.x, vector.y);
  if (length <= state.tolerance.absolute) return { start, end };
  const reach = Math.max(state.viewport.width, state.viewport.height) * 3;
  const unit = { x: vector.x / length, y: vector.y / length };
  return {
    start: object.kind === "line"
      ? { x: start.x - unit.x * reach, y: start.y - unit.y * reach }
      : start,
    end: { x: start.x + unit.x * reach, y: start.y + unit.y * reach },
  };
}

function angleArcPath(
  start: GeometryPointCoordinates,
  vertex: GeometryPointCoordinates,
  end: GeometryPointCoordinates,
  radius: number,
): { path: string; label: GeometryPointCoordinates } | null {
  const first = geometryVector(vertex, start);
  const second = geometryVector(vertex, end);
  const firstLength = Math.hypot(first.x, first.y);
  const secondLength = Math.hypot(second.x, second.y);
  if (firstLength === 0 || secondLength === 0) return null;
  const firstPoint = {
    x: vertex.x + first.x / firstLength * radius,
    y: vertex.y + first.y / firstLength * radius,
  };
  const secondPoint = {
    x: vertex.x + second.x / secondLength * radius,
    y: vertex.y + second.y / secondLength * radius,
  };
  const sweep = geometryCross(first, second) >= 0 ? 1 : 0;
  const bisector = {
    x: first.x / firstLength + second.x / secondLength,
    y: first.y / firstLength + second.y / secondLength,
  };
  const bisectorLength = Math.hypot(bisector.x, bisector.y) || 1;
  return {
    path: `M ${firstPoint.x} ${firstPoint.y} A ${radius} ${radius} 0 0 ${sweep} ${secondPoint.x} ${secondPoint.y}`,
    label: {
      x: vertex.x + bisector.x / bisectorLength * (radius + 20),
      y: vertex.y + bisector.y / bisectorLength * (radius + 20),
    },
  };
}

function objectMidpoint(state: GeometryLabState, object: GeometryObject): GeometryPointCoordinates | null {
  const start = pointById(state.points, object.startPointId);
  const end = pointById(state.points, object.endPointId);
  return start && end ? { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 } : null;
}

export function GeometryScene({
  state,
  showHandles,
  highContrast = false,
  theme = "plain",
  onPointPointerDown,
  onPointPointerMove,
  onPointPointerUp,
  onPointKeyDown,
  onPointSelect,
}: GeometrySceneProps) {
  const analysis = analyzeGeometryPolygon(state);
  const polygonPoints = state.polygon.vertexIds
    .map((id) => pointById(state.points, id))
    .filter((point): point is NonNullable<typeof point> => Boolean(point));
  const polygonPath = polygonPoints.map((point) => `${point.x},${point.y}`).join(" ");
  const objects = state.objects;
  const polygonEdges = polygonEdgeObjects(state);
  const intersections = calculateGeometryIntersections(state);
  const gridLines = state.grid.visible ? [
    ...Array.from({ length: Math.floor(state.viewport.width / state.grid.step) + 1 }, (_, index) => ({
      id: `grid-x-${index}`,
      x1: index * state.grid.step,
      y1: 0,
      x2: index * state.grid.step,
      y2: state.viewport.height,
    })),
    ...Array.from({ length: Math.floor(state.viewport.height / state.grid.step) + 1 }, (_, index) => ({
      id: `grid-y-${index}`,
      x1: 0,
      y1: index * state.grid.step,
      x2: state.viewport.width,
      y2: index * state.grid.step,
    })),
  ] : [];
  const stroke = highContrast ? "#000" : "#1e3a8a";
  const fill = highContrast ? "#fff" : "#dbeafe";

  return (
    <>
      <defs>
        <pattern id="geometry-warning-pattern" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="10" height="10" fill="#fff7ed" />
          <line x1="0" y1="0" x2="0" y2="10" stroke="#c2410c" strokeWidth="4" />
        </pattern>
        <marker id="geometry-ray-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill={stroke} />
        </marker>
      </defs>
      <rect width={state.viewport.width} height={state.viewport.height} rx="14" fill={highContrast ? "#fff" : "#f8fafc"} />
      {theme === "playground" && !highContrast ? (
        <g aria-hidden="true" opacity=".42" data-geometry-theme="playground">
          <path d="M0 352 C90 320 150 365 235 340 C335 310 415 360 640 325 L640 420 L0 420 Z" fill="#bbf7d0" />
          <circle cx="74" cy="72" r="34" fill="#fde68a" />
          <path d="M545 335 L565 190 L585 335 M555 235 H575 M550 270 H580 M548 305 H582" fill="none" stroke="#92400e" strokeWidth="9" strokeLinecap="round" />
          <path d="M530 195 Q565 145 600 195" fill="none" stroke="#0f766e" strokeWidth="8" strokeLinecap="round" />
          <path d="M38 350 L62 238 L86 350 M51 278 H73" fill="none" stroke="#a16207" strokeWidth="8" strokeLinecap="round" />
          <path d="M48 242 Q62 215 76 242" fill="none" stroke="#be123c" strokeWidth="7" strokeLinecap="round" />
        </g>
      ) : null}
      <g aria-label={`Siatka co ${state.grid.step} jednostek`} opacity={highContrast ? .28 : .38}>
        {gridLines.map((line) => <line key={line.id} {...line} stroke={highContrast ? "#000" : "#94a3b8"} strokeWidth="1" />)}
      </g>

      {state.constraints.filter((constraint) => constraint.kind === "symmetry").map((constraint) => {
        if (constraint.kind !== "symmetry") return null;
        const length = Math.hypot(constraint.axis.direction.x, constraint.axis.direction.y) || 1;
        const reach = Math.max(state.viewport.width, state.viewport.height) * 2;
        const dx = constraint.axis.direction.x / length * reach;
        const dy = constraint.axis.direction.y / length * reach;
        return <line key={constraint.id} x1={constraint.axis.anchor.x - dx} y1={constraint.axis.anchor.y - dy} x2={constraint.axis.anchor.x + dx} y2={constraint.axis.anchor.y + dy} stroke="#7c3aed" strokeWidth="2" strokeDasharray="9 7" aria-label="Oś symetrii" />;
      })}

      {state.constraints.filter((constraint) => constraint.kind === "fixed-radius").map((constraint) => {
        if (constraint.kind !== "fixed-radius") return null;
        const center = pointById(state.points, constraint.centerPointId);
        return center ? <circle key={constraint.id} cx={center.x} cy={center.y} r={constraint.radius} fill="none" stroke="#0891b2" strokeWidth="2" strokeDasharray="4 5" aria-label={`Okrąg o stałym promieniu ${constraint.radius}`} /> : null;
      })}

      {objects.map((object) => {
        const endpoints = extendedObjectEndpoints(state, object);
        if (!endpoints) return null;
        const labelPoint = objectMidpoint(state, object);
        const markerEnd = object.kind === "ray" ? "url(#geometry-ray-arrow)" : undefined;
        return (
          <g key={object.id} data-geometry-object={object.kind} data-object-id={object.id}>
            <line x1={endpoints.start.x} y1={endpoints.start.y} x2={endpoints.end.x} y2={endpoints.end.y} stroke={stroke} strokeWidth="3" markerEnd={markerEnd} />
            {object.label && labelPoint ? <text x={clampLabel(labelPoint.x, state.viewport.width)} y={clampLabel(labelPoint.y - 8, state.viewport.height)} textAnchor="middle" fill="#0f172a" fontSize="15" fontWeight="800">{object.label}</text> : null}
          </g>
        );
      })}

      {state.polygon.closed ? (
        <polygon
          points={polygonPath}
          fill={analysis.status === "invalid" ? "url(#geometry-warning-pattern)" : fill}
          fillOpacity={highContrast ? .65 : .72}
          stroke={analysis.status === "invalid" ? "#c2410c" : stroke}
          strokeWidth="4"
          strokeLinejoin="round"
          data-geometry-polygon
          data-analysis-status={analysis.status}
        />
      ) : (
        <polyline points={polygonPath} fill="none" stroke={stroke} strokeWidth="4" strokeLinejoin="round" data-geometry-polygon />
      )}

      {polygonEdges.map((edge, index) => {
        const start = pointById(state.points, edge.startPointId);
        const end = pointById(state.points, edge.endPointId);
        if (!start || !end || !state.polygon.showSideLengths) return null;
        const midpoint = { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 };
        const vector = geometryVector(start, end);
        const length = Math.hypot(vector.x, vector.y) || 1;
        const offset = { x: -vector.y / length * 15, y: vector.x / length * 15 };
        const exact = analysis.sideLengths[index]?.exact ?? exactGeometryLength(start, end).exact;
        return (
          <g key={`${edge.id}-measure`} data-side-label={edge.label}>
            <rect x={clampLabel(midpoint.x + offset.x, state.viewport.width) - 24} y={clampLabel(midpoint.y + offset.y, state.viewport.height) - 12} width="48" height="20" rx="8" fill="#fff" opacity=".9" />
            <text x={clampLabel(midpoint.x + offset.x, state.viewport.width)} y={clampLabel(midpoint.y + offset.y + 3, state.viewport.height)} textAnchor="middle" fill="#0f172a" fontSize="12" fontWeight="800">{exact}</text>
          </g>
        );
      })}

      {polygonEdges.map((edge, index) => {
        const current = analysis.sideLengths[index];
        const equalIndexes = current
          ? analysis.sideLengths.flatMap((candidate, candidateIndex) => candidate.squared === current.squared ? [candidateIndex] : [])
          : [];
        if (!current || equalIndexes.length < 2 || equalIndexes[0] !== index) return null;
        const markNumber = Math.min(3, analysis.sideLengths.slice(0, index).filter((candidate, candidateIndex) => (
          analysis.sideLengths.some((other, otherIndex) => otherIndex !== candidateIndex && other.squared === candidate.squared)
        )).length + 1);
        return equalIndexes.map((edgeIndex) => {
          const equalEdge = polygonEdges[edgeIndex];
          const start = equalEdge ? pointById(state.points, equalEdge.startPointId) : null;
          const end = equalEdge ? pointById(state.points, equalEdge.endPointId) : null;
          if (!start || !end) return null;
          const midpoint = { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 };
          const vector = geometryVector(start, end);
          const length = Math.hypot(vector.x, vector.y) || 1;
          const normal = { x: -vector.y / length, y: vector.x / length };
          const tangent = { x: vector.x / length, y: vector.y / length };
          return (
            <g key={`equal-mark-${index}-${edgeIndex}`} data-equal-side-mark={markNumber} aria-label={`Jednakowe oznaczenie boku ${equalEdge.label ?? edgeIndex + 1}`}>
              {Array.from({ length: markNumber }, (_, markIndex) => {
                const shift = (markIndex - (markNumber - 1) / 2) * 7;
                const cx = midpoint.x + tangent.x * shift;
                const cy = midpoint.y + tangent.y * shift;
                return <line key={markIndex} x1={cx - normal.x * 7} y1={cy - normal.y * 7} x2={cx + normal.x * 7} y2={cy + normal.y * 7} stroke="#7c3aed" strokeWidth="3.5" strokeLinecap="round" />;
              })}
            </g>
          );
        });
      })}

      {state.angles.map((angle) => {
        const start = pointById(state.points, angle.startPointId);
        const vertex = pointById(state.points, angle.vertexPointId);
        const end = pointById(state.points, angle.endPointId);
        if (!start || !vertex || !end) return null;
        const measure = angleBetweenPointsDegrees(start, vertex, end);
        const arc = angleArcPath(start, vertex, end, 34);
        if (!arc) return null;
        return (
          <g key={angle.id} data-geometry-angle={angle.id}>
            {angle.showArc !== false ? <path d={arc.path} fill="none" stroke="#7c3aed" strokeWidth="3" data-angle-arc /> : null}
            {angle.showRightAngleTarget || Math.abs(measure - 90) <= state.tolerance.angleDegrees ? <text x={vertex.x + 22} y={vertex.y - 15} fill="#7c3aed" fontSize="19" fontWeight="900">□</text> : null}
            {angle.showMeasure !== false ? <text x={clampLabel(arc.label.x, state.viewport.width)} y={clampLabel(arc.label.y, state.viewport.height)} textAnchor="middle" fill="#5b21b6" fontSize="13" fontWeight="900">{angle.label ? `${angle.label} ` : ""}{Number.isFinite(measure) ? `${measure.toFixed(1)}°` : "—"}</text> : null}
          </g>
        );
      })}

      {state.constraints.flatMap((constraint) => {
        if (constraint.kind === "fixed-radius" || constraint.kind === "symmetry") return [];
        const objectIds = [constraint.referenceObjectId, ...constraint.targetObjectIds];
        const symbol = constraint.kind === "parallel" ? "∥" : constraint.kind === "perpendicular" ? "□" : "|";
        return objectIds.map((objectId, index) => {
          const object = allGeometryObjects(state).find((candidate) => candidate.id === objectId);
          const midpoint = object ? objectMidpoint(state, object) : null;
          return midpoint ? <text key={`${constraint.id}-${objectId}`} x={midpoint.x} y={midpoint.y - 9} textAnchor="middle" fill="#7c3aed" fontSize="17" fontWeight="900" aria-label={`${symbol} oznaczenie ograniczenia ${index + 1}`}>{symbol}</text> : null;
        });
      })}

      {state.protractor.visible ? (
        <g transform={`translate(${state.protractor.center.x} ${state.protractor.center.y}) rotate(${state.protractor.rotationDegrees})`} data-geometry-protractor opacity=".9">
          <path d={`M ${-state.protractor.radius} 0 A ${state.protractor.radius} ${state.protractor.radius} 0 0 1 ${state.protractor.radius} 0 L ${-state.protractor.radius} 0`} fill="#fef3c7" fillOpacity=".48" stroke="#92400e" strokeWidth="2" />
          {Array.from({ length: 37 }, (_, index) => index * 5).map((degrees) => {
            const radians = degrees * Math.PI / 180;
            const outer = { x: Math.cos(radians) * state.protractor.radius, y: -Math.sin(radians) * state.protractor.radius };
            const tick = degrees % 10 === 0 ? 10 : 5;
            const innerRadius = state.protractor.radius - tick;
            const inner = { x: Math.cos(radians) * innerRadius, y: -Math.sin(radians) * innerRadius };
            return <line key={degrees} x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} stroke="#92400e" strokeWidth={degrees % 10 === 0 ? 1.5 : 1} />;
          })}
          {Array.from({ length: 7 }, (_, index) => index * 30).map((degrees) => {
            const radians = degrees * Math.PI / 180;
            const radius = state.protractor.radius - 22;
            const label = state.protractor.scale === "inner" ? 180 - degrees : degrees;
            return <text key={degrees} x={Math.cos(radians) * radius} y={-Math.sin(radians) * radius + 4} textAnchor="middle" fill="#78350f" fontSize="10" fontWeight="800">{label}</text>;
          })}
          <circle cx="0" cy="0" r="5" fill="#fff" stroke="#92400e" strokeWidth="2" />
          <line x1={-state.protractor.radius} y1="0" x2={state.protractor.radius} y2="0" stroke="#92400e" strokeWidth="2" />
        </g>
      ) : null}

      {intersections.map((intersection, index) => (
        <g key={`${intersection.firstObjectId}-${intersection.secondObjectId}-${index}`} data-geometry-intersection>
          <circle cx={intersection.point.x} cy={intersection.point.y} r="9" fill="#fff" stroke="#c2410c" strokeWidth="3" />
          <text x={intersection.point.x} y={intersection.point.y + 5} textAnchor="middle" fill="#c2410c" fontSize="15" fontWeight="900">×</text>
        </g>
      ))}

      {state.points.map((point) => {
        const selected = point.id === state.selectedPointId;
        const duplicate = analysis.duplicatePointIds.includes(point.id);
        const labelX = clampLabel(point.x + (point.x < state.viewport.width / 2 ? -14 : 14), state.viewport.width);
        const labelY = clampLabel(point.y + (point.y < state.viewport.height / 2 ? -15 : 19), state.viewport.height);
        return (
          <g key={point.id} data-geometry-point={point.id}>
            <circle cx={point.x} cy={point.y} r="6" fill={duplicate ? "#c2410c" : highContrast ? "#000" : "#1d4ed8"} stroke="#fff" strokeWidth="2" />
            <text x={labelX} y={labelY} textAnchor="middle" fill="#0f172a" fontSize="16" fontWeight="900">{duplicate ? "△" : point.label}</text>
            {showHandles ? (
              <circle
                cx={point.x}
                cy={point.y}
                r="26"
                fill="transparent"
                stroke={selected ? "#0ea5e9" : "transparent"}
                strokeWidth="4"
                role="button"
                tabIndex={point.locked ? -1 : 0}
                aria-label={`Wierzchołek ${point.label}. x ${point.x}, y ${point.y}`}
                aria-pressed={selected}
                data-geometry-handle={point.id}
                onFocus={() => onPointSelect?.(point.id)}
                onClick={() => onPointSelect?.(point.id)}
                onPointerDown={(event) => onPointPointerDown?.(point.id, event)}
                onPointerMove={(event) => onPointPointerMove?.(point.id, event)}
                onPointerUp={(event) => onPointPointerUp?.(point.id, event)}
                onPointerCancel={(event) => onPointPointerUp?.(point.id, event)}
                onKeyDown={(event) => onPointKeyDown?.(point.id, event)}
                style={{ cursor: point.locked ? "not-allowed" : "grab", touchAction: "none" }}
              />
            ) : null}
          </g>
        );
      })}
    </>
  );
}
