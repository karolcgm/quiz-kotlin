import { describe, expect, it } from "vitest";
import { analyzeGeometryPolygon } from "@/lib/math/geometry";
import {
  TRIANGLE_TYPES_LESSON_SEEDS,
  applyTriangleSidePreset,
  createPublicTriangleTypesTask,
  createTriangleTypesGeometryState,
  isTriangleTypesLessonSeed,
  moveTriangleVertex,
  triangleClassificationPairIsPossible,
  triangleClassifications,
} from "@/lib/math/geometry/triangleTypes";

describe("generator rodzajów trójkątów", () => {
  it("ma deterministyczne seedy wszystkich aktywności i poziomów", () => {
    const seeds = Object.values(TRIANGLE_TYPES_LESSON_SEEDS).flatMap((levels) => Object.values(levels));
    expect(seeds).toHaveLength(21);
    expect(new Set(seeds).size).toBe(21);
    seeds.forEach((seed) => {
      expect(isTriangleTypesLessonSeed(seed)).toBe(true);
      expect(createPublicTriangleTypesTask(seed)).toMatchObject({ generatorId: "geometry-triangle-types-v1", generatorVersion: 1, seed });
    });
  });

  it("wyznacza dwie niezależne klasyfikacje z aktualnych współrzędnych", () => {
    const state = createTriangleTypesGeometryState(460101);
    expect(triangleClassifications(state)).toEqual({ side: "isosceles", angle: "acute" });
    const moved = moveTriangleVertex(state, "vertex-3", { x: 480, y: 180 });
    expect(analyzeGeometryPolygon(moved).status).toBe("valid");
    expect(triangleClassifications(moved)).not.toEqual(triangleClassifications(state));
  });

  it("oznacza figurę zdegenerowaną jako invalid zamiast nadawać fałszywą nazwę", () => {
    const state = createTriangleTypesGeometryState(460101);
    const first = state.points.find((point) => point.id === "vertex-1")!;
    const second = state.points.find((point) => point.id === "vertex-2")!;
    const flattened = moveTriangleVertex(state, "vertex-3", { x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 });
    expect(analyzeGeometryPolygon(flattened).status).toBe("invalid");
    expect(triangleClassifications(flattened)).toBeNull();
  });

  it("rozstrzyga pary możliwe i niemożliwe bez opierania się na obrazku", () => {
    expect(triangleClassificationPairIsPossible("equilateral", "acute")).toBe(true);
    expect(triangleClassificationPairIsPossible("equilateral", "right")).toBe(false);
    expect(triangleClassificationPairIsPossible("equilateral", "obtuse")).toBe(false);
    expect(triangleClassificationPairIsPossible("isosceles", "right")).toBe(true);
    expect(triangleClassificationPairIsPossible("scalene", "obtuse")).toBe(true);
  });

  it("buduje trzy czytelne modele boków bez potrzeby obliczania pierwiastków", () => {
    const state = createTriangleTypesGeometryState(460101);
    expect(triangleClassifications(applyTriangleSidePreset(state, "equilateral"))?.side).toBe("equilateral");
    expect(triangleClassifications(applyTriangleSidePreset(state, "isosceles"))?.side).toBe("isosceles");
    expect(triangleClassifications(applyTriangleSidePreset(state, "scalene"))?.side).toBe("scalene");
  });
});
