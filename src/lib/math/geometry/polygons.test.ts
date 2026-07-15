import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  POLYGON_LESSON_SEEDS,
  addPolygonVertex,
  analyzePolygonLessonState,
  createPolygonGeometryState,
  createPolygonStateForValidityCase,
  createPublicPolygonTask,
  diagonalEndpointIds,
  isPolygonLessonSeed,
  movePolygonVertex,
  polygonNameForSideCount,
  removePolygonVertex,
  setPolygonClosed,
} from "@/lib/math/geometry/polygons";

describe("WP-S4-05 — matematyka wielokątów", () => {
  it("generuje deterministycznie sześć historii i trzy poziomy w izolowanej przestrzeni seedów", () => {
    for (const activity of ["builder", "validity", "elements", "reshape", "stained-glass", "independent"] as const) {
      for (const difficulty of ["support", "core", "challenge"] as const) {
        const seed = POLYGON_LESSON_SEEDS[activity][difficulty];
        const task = createPublicPolygonTask(seed);
        expect(createPublicPolygonTask(seed)).toEqual(task);
        expect(task).toMatchObject({ activity, difficulty, generatorId: "geometry-polygon-builder-l1-v1", generatorVersion: 1 });
        expect(task.targetVertexCount).toBeGreaterThanOrEqual(3);
        expect(task.targetVertexCount).toBeLessThanOrEqual(8);
        expect(task.invariants).toEqual(expect.arrayContaining([
          "3-to-8-vertices",
          "closure-only-after-selecting-first-vertex",
          "open-curved-and-self-intersecting-figures-are-not-polygons",
          "vertices-sides-and-perimeter-update-in-real-time",
          "touch-target-52-px",
          "keyboard-and-coordinate-alternative",
          "answer-spec-server-only",
        ]));
        expect(task).not.toHaveProperty("answerSpec");
        expect(isPolygonLessonSeed(seed)).toBe(true);
      }
    }
    expect(isPolygonLessonSeed(450100)).toBe(false);
    expect(isPolygonLessonSeed(450604)).toBe(false);
    expect(isPolygonLessonSeed(440701)).toBe(false);
  });

  it("rozróżnia linię otwartą, łuk, samoprzecięcie i poprawny wklęsły wielokąt", () => {
    const seed = POLYGON_LESSON_SEEDS.validity.core;
    expect(analyzePolygonLessonState(createPolygonStateForValidityCase(seed, "open"))).toMatchObject({
      closed: false, validPolygon: false, errorCodes: expect.arrayContaining(["POLYGON_NOT_CLOSED"]),
    });
    expect(analyzePolygonLessonState(createPolygonStateForValidityCase(seed, "curved"), { hasCurvedEdge: true })).toMatchObject({
      hasCurvedEdge: true, validPolygon: false, errorCodes: expect.arrayContaining(["POLYGON_CURVED_EDGE"]),
    });
    expect(analyzePolygonLessonState(createPolygonStateForValidityCase(seed, "self-intersecting"))).toMatchObject({
      selfIntersecting: true, validPolygon: false, errorCodes: expect.arrayContaining(["GEO_SELF_INTERSECTION"]),
    });
    expect(analyzePolygonLessonState(createPolygonStateForValidityCase(seed, "valid-concave"))).toMatchObject({
      validPolygon: true, concave: true, polygonName: "pięciokąt", errorCodes: [],
    });
  });

  it("buduje 3–8 wierzchołków, domyka jawnie i aktualizuje obwód po ruchu", () => {
    let state = createPolygonGeometryState(POLYGON_LESSON_SEEDS.builder.support);
    expect(analyzePolygonLessonState(state)).toMatchObject({ vertexCount: 3, drawnSegmentCount: 2, perimeter: null });
    for (let count = 4; count <= 8; count += 1) state = addPolygonVertex(state);
    expect(state.polygon.vertexIds).toHaveLength(8);
    expect(addPolygonVertex(state).polygon.vertexIds).toHaveLength(8);
    state = setPolygonClosed(state, true);
    const before = analyzePolygonLessonState(state);
    expect(before.vertexCount).toBe(8);
    expect(before.perimeter).not.toBeNull();
    const first = state.points.find((point) => point.id === state.polygon.vertexIds[0])!;
    state = movePolygonVertex(state, first.id, { x: first.x + 40, y: first.y + 20 });
    expect(analyzePolygonLessonState(state).perimeter).not.toBe(before.perimeter);
    for (let count = 7; count >= 3; count -= 1) state = removePolygonVertex(state);
    expect(state.polygon.vertexIds).toHaveLength(3);
    expect(removePolygonVertex(state).polygon.vertexIds).toHaveLength(3);
  });

  it("wylicza nazwy 3–8 oraz dokładnie n−3 końców przekątnych z jednego wierzchołka", () => {
    const expected = ["trójkąt", "czworokąt", "pięciokąt", "sześciokąt", "siedmiokąt", "ośmiokąt"];
    expected.forEach((name, index) => expect(polygonNameForSideCount(index + 3)).toBe(name));
    for (const difficulty of ["support", "core", "challenge"] as const) {
      const state = createPolygonGeometryState(POLYGON_LESSON_SEEDS.elements[difficulty]);
      const first = state.polygon.vertexIds[0]!;
      expect(diagonalEndpointIds(state, first)).toHaveLength(state.polygon.vertexIds.length - 3);
      expect(diagonalEndpointIds(state, first)).not.toContain(state.polygon.vertexIds[1]);
      expect(diagonalEndpointIds(state, first)).not.toContain(state.polygon.vertexIds.at(-1));
    }
  });

  it("utrzymuje nazwę, warunki, przekątne i punktację wyłącznie w module server-only", () => {
    const serverSource = readFileSync(new URL("./polygons.server.ts", import.meta.url), "utf8");
    const publicSource = readFileSync(new URL("./polygons.ts", import.meta.url), "utf8");
    expect(serverSource).toContain('import "server-only"');
    expect(serverSource).toContain("answerSpec");
    expect(serverSource).toContain("expectedPolygonName");
    expect(serverSource).toContain("allowedDiagonalEndpointIdsFromFirstVertex");
    expect(serverSource).toContain("perimeterTolerance");
    expect(serverSource).toContain("convexityIsAssessed: false");
    expect(publicSource).not.toContain("answerSpec:");
    expect(publicSource).not.toContain("expectedPolygonName:");
  });
});
