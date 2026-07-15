import { describe, expect, it } from "vitest";
import {
  applyGeometryConstraints,
  commitGeometryHistory,
  createDefaultGeometryState,
  createGeometryHistory,
  createGeometryPrintSnapshot,
  deserializeGeometryState,
  moveGeometryPoint,
  redoGeometryHistory,
  resetGeometryHistory,
  resizeGeometryPolygon,
  serializeGeometryState,
  undoGeometryHistory,
} from "@/lib/math/geometry";
import type { GeometryConstraint, GeometryLabState, GeometryObject, GeometryPointCoordinates } from "@/types/geometry";

function triangleState(
  coordinates: [GeometryPointCoordinates, GeometryPointCoordinates, GeometryPointCoordinates],
  objects: GeometryObject[],
  constraints: GeometryConstraint[],
): GeometryLabState {
  const state = createDefaultGeometryState({ vertexCount: 3 });
  return {
    ...state,
    viewport: { ...state.viewport, padding: 0 },
    grid: { ...state.grid, snap: false },
    points: state.points.map((point, index) => ({ ...point, ...coordinates[index] })),
    objects,
    constraints,
  };
}

describe("ograniczenia geometrii", () => {
  it("utrzymuje równość długości", () => {
    const base = createDefaultGeometryState({ vertexCount: 3 });
    const [a, b, c] = base.polygon.vertexIds;
    const state = triangleState(
      [{ x: 10, y: 0 }, { x: 20, y: 0 }, { x: 26, y: 6 }],
      [{ id: "reference", kind: "segment", startPointId: a, endPointId: b }, { id: "target", kind: "segment", startPointId: b, endPointId: c }],
      [{ id: "equal", kind: "equal-length", referenceObjectId: "reference", targetObjectIds: ["target"] }],
    );
    const constrained = moveGeometryPoint(state, c, { x: 20, y: 10 });
    const pointB = constrained.points.find((point) => point.id === b)!;
    const pointC = constrained.points.find((point) => point.id === c)!;
    expect(Math.hypot(pointC.x - pointB.x, pointC.y - pointB.y)).toBeCloseTo(10);
    const referenceMoved = moveGeometryPoint(state, a, { x: 0, y: 0 });
    const movedB = referenceMoved.points.find((point) => point.id === b)!;
    const movedC = referenceMoved.points.find((point) => point.id === c)!;
    expect(Math.hypot(movedC.x - movedB.x, movedC.y - movedB.y)).toBeCloseTo(20);
  });

  it("utrzymuje równoległość i prostopadłość na surowych wektorach", () => {
    const base = createDefaultGeometryState({ vertexCount: 3 });
    const [a, b, c] = base.polygon.vertexIds;
    const objects: GeometryObject[] = [
      { id: "reference", kind: "segment", startPointId: a, endPointId: b },
      { id: "target", kind: "segment", startPointId: b, endPointId: c },
    ];
    const parallel = triangleState(
      [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 12, y: 8 }],
      objects,
      [{ id: "parallel", kind: "parallel", referenceObjectId: "reference", targetObjectIds: ["target"] }],
    );
    const parallelResult = moveGeometryPoint(parallel, c, { x: 18, y: 7 });
    expect(parallelResult.points.find((point) => point.id === c)?.y).toBeCloseTo(0);
    const parallelReferenceMoved = moveGeometryPoint(parallel, a, { x: 0, y: 5 });
    const movedTargetStart = parallelReferenceMoved.points.find((point) => point.id === b)!;
    const movedTargetEnd = parallelReferenceMoved.points.find((point) => point.id === c)!;
    const referenceStart = parallelReferenceMoved.points.find((point) => point.id === a)!;
    expect((movedTargetEnd.x - movedTargetStart.x) * (movedTargetStart.y - referenceStart.y)
      - (movedTargetEnd.y - movedTargetStart.y) * (movedTargetStart.x - referenceStart.x)).toBeCloseTo(0);

    const perpendicular = { ...parallel, constraints: [{ id: "perpendicular", kind: "perpendicular" as const, referenceObjectId: "reference", targetObjectIds: ["target"] }] };
    const perpendicularResult = moveGeometryPoint(perpendicular, c, { x: 18, y: 7 });
    expect(perpendicularResult.points.find((point) => point.id === c)?.x).toBeCloseTo(10);
  });

  it("utrzymuje stały promień", () => {
    const base = createDefaultGeometryState({ vertexCount: 3 });
    const [a, b] = base.polygon.vertexIds;
    const state = triangleState(
      [{ x: 0, y: 0 }, { x: 2, y: 0 }, { x: 0, y: 3 }],
      [],
      [{ id: "radius", kind: "fixed-radius", centerPointId: a, pointIds: [b], radius: 5 }],
    );
    const result = moveGeometryPoint(state, b, { x: 30, y: 40 });
    const point = result.points.find((candidate) => candidate.id === b)!;
    expect(Math.hypot(point.x, point.y)).toBeCloseTo(5);
  });

  it("przesuwa punkt sparowany symetrycznie", () => {
    const base = createDefaultGeometryState({ vertexCount: 3 });
    const [a, b] = base.polygon.vertexIds;
    const state = triangleState(
      [{ x: 2, y: 1 }, { x: 8, y: 1 }, { x: 5, y: 6 }],
      [],
      [{ id: "symmetry", kind: "symmetry", axis: { anchor: { x: 5, y: 0 }, direction: { x: 0, y: 1 } }, pointPairs: [[a, b]] }],
    );
    const result = moveGeometryPoint(state, a, { x: 1, y: 4 });
    expect(result.points.find((point) => point.id === b)).toMatchObject({ x: 9, y: 4 });
  });

  it("może zastosować ograniczenia do krawędzi generowanych przez wielokąt", () => {
    const state = createDefaultGeometryState({ vertexCount: 4 });
    const constrained = {
      ...state,
      constraints: [{ id: "parallel", kind: "parallel" as const, referenceObjectId: "polygon-main-edge-0", targetObjectIds: ["polygon-main-edge-2"] }],
    };
    expect(() => applyGeometryConstraints(constrained, constrained.polygon.vertexIds[3])).not.toThrow();
  });
});

describe("stan, historia, serializacja i druk", () => {
  it("obsługuje wielokąty od 3 do 8 wierzchołków", () => {
    let state = createDefaultGeometryState({ vertexCount: 3 });
    for (let count = 3; count <= 8; count += 1) {
      state = resizeGeometryPolygon(state, count);
      expect(state.polygon.vertexIds).toHaveLength(count);
      expect(state.points.filter((point) => state.polygon.vertexIds.includes(point.id)).map((point) => point.label)).toEqual(
        Array.from({ length: count }, (_, index) => String.fromCharCode(65 + index)),
      );
    }
    expect(resizeGeometryPolygon(state, 99).polygon.vertexIds).toHaveLength(8);
    expect(resizeGeometryPolygon(state, 1).polygon.vertexIds).toHaveLength(3);
  });

  it("cofa, ponawia i resetuje pełny stan", () => {
    const initial = createDefaultGeometryState();
    const firstPoint = initial.points[0];
    const moved = moveGeometryPoint(initial, firstPoint.id, { x: firstPoint.x + 40, y: firstPoint.y });
    const committed = commitGeometryHistory(createGeometryHistory(initial), moved);
    expect(committed.past).toHaveLength(1);
    const undone = undoGeometryHistory(committed);
    expect(undone.present.points[0].x).toBe(initial.points[0].x);
    expect(redoGeometryHistory(undone).present.points[0].x).toBe(moved.points[0].x);
    expect(resetGeometryHistory(committed).present).toEqual(initial);
  });

  it("serializuje i odtwarza stan bez funkcji i utraty wartości", () => {
    const state = createDefaultGeometryState({ seed: 9, vertexCount: 7, mode: "guided" });
    const serialized = serializeGeometryState(state);
    expect(deserializeGeometryState(serialized)).toEqual(state);
    expect(serialized).not.toContain("function");
    expect(() => deserializeGeometryState(JSON.stringify({ ...state, version: 2 }))).toThrow(/wersja/u);
    expect(() => deserializeGeometryState(JSON.stringify({ ...state, points: [{ ...state.points[0], x: Number.NaN }] }))).toThrow(/skończonymi/u);
  });

  it("tworzy zgodną migawkę druku bez zaznaczenia i uchwytów", () => {
    const state = createDefaultGeometryState();
    const snapshot = createGeometryPrintSnapshot(state);
    expect(snapshot.includeHandles).toBe(false);
    expect(snapshot.state.selectedPointId).toBeNull();
    expect(snapshot.state.polygon.vertexIds).toEqual(state.polygon.vertexIds);
  });

  it("skalowanie widoku nie zmienia wartości matematycznych", () => {
    const state = createDefaultGeometryState();
    const serializedPoints = JSON.stringify(state.points);
    const zoomed = { ...state, viewport: { ...state.viewport, scale: 2 } };
    expect(JSON.stringify(zoomed.points)).toBe(serializedPoints);
  });
});
