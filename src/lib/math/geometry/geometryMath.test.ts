import { describe, expect, it } from "vitest";
import {
  analyzeGeometryPolygon,
  angleBetweenPointsDegrees,
  areParallelVectors,
  arePerpendicularVectors,
  directedMathAngleDegrees,
  exactGeometryLength,
  geometryCross,
  geometryDot,
  geometryVector,
  intersectGeometryObjects,
  isPointSetSymmetricAcrossAxis,
  reflectPointAcrossAxis,
  triangleSideLengthsAreValid,
} from "@/lib/math/geometry";
import { createDefaultGeometryState } from "@/lib/math/geometry/geometryState";
import { GEOMETRY_FEEDBACK_CODES } from "@/types/geometry";
import type { GeometryLabState, GeometryPointCoordinates } from "@/types/geometry";

function stateForPolygon(
  coordinates: GeometryPointCoordinates[],
  options: { snap?: boolean; vertexIds?: string[] } = {},
): GeometryLabState {
  const state = createDefaultGeometryState({ vertexCount: coordinates.length });
  const vertexIds = options.vertexIds ?? state.polygon.vertexIds;
  const coordinateById = new Map(state.polygon.vertexIds.map((id, index) => [id, coordinates[index]]));
  return {
    ...state,
    grid: { ...state.grid, snap: options.snap ?? true },
    viewport: { ...state.viewport, padding: 0 },
    points: state.points.map((point) => ({ ...point, ...(coordinateById.get(point.id) ?? {}) })),
    polygon: { ...state.polygon, vertexIds },
  };
}

function transform(
  points: GeometryPointCoordinates[],
  angleDegrees: number,
  scale: number,
  reflect: boolean,
): GeometryPointCoordinates[] {
  const radians = angleDegrees * Math.PI / 180;
  return points.map((point) => {
    const x = (reflect ? -point.x : point.x) * scale;
    const y = point.y * scale;
    return {
      x: x * Math.cos(radians) - y * Math.sin(radians) + 217,
      y: x * Math.sin(radians) + y * Math.cos(radians) - 83,
    };
  });
}

describe("geometria wektorowa i dokładne wartości", () => {
  it("liczy wektory, iloczyny i długości bez opierania walidacji na zaokrąglonym tekście", () => {
    const vector = geometryVector({ x: 1, y: 2 }, { x: 3, y: 4 });
    expect(vector).toEqual({ x: 2, y: 2 });
    expect(geometryDot(vector, { x: 2, y: -2 })).toBe(0);
    expect(geometryCross(vector, { x: 2, y: -2 })).toBe(-8);
    expect(exactGeometryLength({ x: 0, y: 0 }, { x: 2, y: 2 })).toEqual({
      squared: 8,
      value: Math.sqrt(8),
      exact: "2√2",
    });
  });

  it("utrzymuje spójny kierunek kątów ekranu i matematycznych", () => {
    expect(angleBetweenPointsDegrees({ x: 1, y: 0 }, { x: 0, y: 0 }, { x: 0, y: -1 })).toBeCloseTo(90);
    expect(directedMathAngleDegrees({ x: 1, y: 0 }, { x: 0, y: 0 }, { x: 0, y: -1 })).toBeCloseTo(90);
    expect(directedMathAngleDegrees({ x: 1, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 1 })).toBeCloseTo(270);
  });

  it("rozróżnia dokładne relacje siatki od jawnej tolerancji swobodnego rysunku", () => {
    expect(areParallelVectors({ x: 2, y: 1 }, { x: 6, y: 3 }, { exact: true })).toBe(true);
    expect(areParallelVectors({ x: 2, y: 1 }, { x: 6, y: 3.05 }, { exact: true })).toBe(false);
    expect(areParallelVectors({ x: 2, y: 1 }, { x: 6, y: 3.05 }, { tolerance: { absolute: 1e-7, angleDegrees: 1, length: .5 } })).toBe(true);
    expect(arePerpendicularVectors({ x: 3, y: 0 }, { x: 0, y: 7 }, { exact: true })).toBe(true);
    expect(arePerpendicularVectors({ x: 1, y: 0 }, { x: Math.cos(89 * Math.PI / 180), y: Math.sin(89 * Math.PI / 180) }, { tolerance: { absolute: 1e-7, angleDegrees: .75, length: .5 } })).toBe(false);
    expect(arePerpendicularVectors({ x: 1, y: 0 }, { x: 0, y: 1 }, { tolerance: { absolute: 1e-7, angleDegrees: .75, length: .5 } })).toBe(true);
    expect(arePerpendicularVectors({ x: 1, y: 0 }, { x: Math.cos(91 * Math.PI / 180), y: Math.sin(91 * Math.PI / 180) }, { tolerance: { absolute: 1e-7, angleDegrees: .75, length: .5 } })).toBe(false);
  });

  it("liczy przecięcia odcinka, półprostej i prostej z domen parametrycznych", () => {
    const points = [
      { id: "a", label: "A", x: 0, y: 0 },
      { id: "b", label: "B", x: 10, y: 0 },
      { id: "c", label: "C", x: 5, y: -5 },
      { id: "d", label: "D", x: 5, y: 5 },
      { id: "e", label: "E", x: -5, y: -5 },
    ];
    const segment = { id: "ab", kind: "segment" as const, startPointId: "a", endPointId: "b" };
    const line = { id: "cd", kind: "line" as const, startPointId: "c", endPointId: "d" };
    const rayAway = { id: "ec", kind: "ray" as const, startPointId: "c", endPointId: "e" };
    expect(intersectGeometryObjects(segment, line, points)?.point).toEqual({ x: 5, y: 0 });
    expect(intersectGeometryObjects(segment, rayAway, points)).toBeNull();
  });

  it("sprawdza nierówność trójkąta bez zaokrąglania długości", () => {
    expect(triangleSideLengthsAreValid([3, 4, 5])).toBe(true);
    expect(triangleSideLengthsAreValid([3, 4, 7])).toBe(false);
    expect(triangleSideLengthsAreValid([3, 4, 7 - 1e-10])).toBe(false);
  });
});

describe("analiza i klasyfikacja wielokątów", () => {
  it("klasyfikuje kwadrat jako figurę szczególną w hierarchii włączającej trapez", () => {
    const analysis = analyzeGeometryPolygon(stateForPolygon([
      { x: 0, y: 0 }, { x: 40, y: 0 }, { x: 40, y: 40 }, { x: 0, y: 40 },
    ]));
    expect(analysis.status).toBe("valid");
    expect(analysis.classification).toEqual(expect.arrayContaining(["kwadrat", "prostokąt", "romb", "równoległobok", "trapez", "czworokąt"]));
    expect(analysis.primaryClassification).toBe("kwadrat");
  });

  it("nie zmienia klasyfikacji po obrocie, przesunięciu, odbiciu ani skalowaniu — 20 konfiguracji", () => {
    const square = [{ x: 0, y: 0 }, { x: 40, y: 0 }, { x: 40, y: 40 }, { x: 0, y: 40 }];
    for (let index = 0; index < 20; index += 1) {
      const transformed = transform(square, index * 17, .6 + index * .11, index % 2 === 1);
      const analysis = analyzeGeometryPolygon(stateForPolygon(transformed, { snap: false }));
      expect(analysis.status, `konfiguracja ${index + 1}`).toBe("valid");
      expect(analysis.primaryClassification, `konfiguracja ${index + 1}`).toBe("kwadrat");
    }
  });

  it("kolejność zgodna lub przeciwna do obiegu nie zmienia klasyfikacji", () => {
    const state = stateForPolygon([{ x: 0, y: 0 }, { x: 60, y: 0 }, { x: 60, y: 30 }, { x: 0, y: 30 }]);
    const forward = analyzeGeometryPolygon(state);
    const reversed = analyzeGeometryPolygon({ ...state, polygon: { ...state.polygon, vertexIds: [...state.polygon.vertexIds].reverse() } });
    expect(forward.primaryClassification).toBe("prostokąt");
    expect(reversed.primaryClassification).toBe("prostokąt");
    expect(forward.orientation).not.toBe(reversed.orientation);
  });

  it("zwraca invalid dla figury zdegenerowanej zamiast fałszywych kątów", () => {
    const analysis = analyzeGeometryPolygon(stateForPolygon([{ x: 0, y: 0 }, { x: 20, y: 0 }, { x: 40, y: 0 }]));
    expect(analysis.status).toBe("invalid");
    expect(analysis.errorCodes).toContain(GEOMETRY_FEEDBACK_CODES.degenerate);
    expect(analysis.classification).toEqual([]);
  });

  it("wykrywa samoprzecięcie i podaje obie przecinające się krawędzie", () => {
    const analysis = analyzeGeometryPolygon(stateForPolygon([
      { x: 0, y: 0 }, { x: 40, y: 40 }, { x: 0, y: 40 }, { x: 40, y: 0 },
    ]));
    expect(analysis.status).toBe("invalid");
    expect(analysis.errorCodes).toContain(GEOMETRY_FEEDBACK_CODES.selfIntersection);
    expect(analysis.intersections[0]).toMatchObject({ firstObjectId: "polygon-main-edge-0", secondObjectId: "polygon-main-edge-2" });
  });

  it("zachowuje kąt wklęsły większy od 180° i rozróżnia figurę prawie zdegenerowaną", () => {
    const concave = analyzeGeometryPolygon(stateForPolygon([
      { x: 0, y: 0 }, { x: 60, y: 0 }, { x: 30, y: 15 }, { x: 60, y: 50 }, { x: 0, y: 50 },
    ], { snap: false }));
    expect(Math.max(...concave.angleDegrees)).toBeGreaterThan(180);

    const almostFlat = stateForPolygon([{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 50, y: 1e-10 }], { snap: false });
    expect(analyzeGeometryPolygon(almostFlat).status).toBe("invalid");
    const narrowButValid = { ...almostFlat, points: almostFlat.points.map((point, index) => index === 2 ? { ...point, y: 1e-4 } : point) };
    expect(analyzeGeometryPolygon(narrowButValid).status).toBe("valid");
  });

  it("odbija punkty względem osi o dowolnym kierunku i rozpoznaje symetrię", () => {
    expect(reflectPointAcrossAxis({ x: 3, y: 2 }, { anchor: { x: 0, y: 0 }, direction: { x: 0, y: 1 } })).toEqual({ x: -3, y: 2 });
    expect(isPointSetSymmetricAcrossAxis(
      [{ x: -2, y: 0 }, { x: 2, y: 0 }, { x: -1, y: 3 }, { x: 1, y: 3 }],
      { anchor: { x: 0, y: 0 }, direction: { x: 0, y: 1 } },
    )).toBe(true);
  });
});
