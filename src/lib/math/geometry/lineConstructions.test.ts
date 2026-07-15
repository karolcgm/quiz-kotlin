import { describe, expect, it } from "vitest";
import { serializeGeometryState } from "@/lib/math/geometry";
import {
  LINE_CONSTRUCTION_LESSON_SEEDS,
  analyzeLineConstruction,
  constructPerpendicularFromTrySquare,
  createLineConstructionGeometryState,
  getLineConstructionSeedConfig,
  lineDirectionChangeFromReference,
  moveTrySquare,
  rotateTrySquare,
  setConstructionLinePose,
} from "@/lib/math/geometry/lineConstructions";

describe("WP-S4-01B — konstrukcje prostych", () => {
  it("odtwarza trzy poznawczo różne konfiguracje deterministyczne", () => {
    const activities = ["perpendicular", "parallel", "network"];
    Object.values(LINE_CONSTRUCTION_LESSON_SEEDS).forEach((seed, index) => {
      const first = createLineConstructionGeometryState(seed);
      const second = createLineConstructionGeometryState(seed);
      expect(serializeGeometryState(first)).toBe(serializeGeometryState(second));
      expect(getLineConstructionSeedConfig(seed).activity).toBe(activities[index]);
    });
  });

  it("konstruuje prostopadłą przez P dopiero po poprawnym ustawieniu ekierki", () => {
    const initial = createLineConstructionGeometryState(LINE_CONSTRUCTION_LESSON_SEEDS.support);
    expect(analyzeLineConstruction(initial).complete).toBe(false);
    const placed = rotateTrySquare(moveTrySquare(initial, { x: 500, y: 300 }), 0);
    expect(analyzeLineConstruction(placed).conditions.slice(0, 3).every((condition) => condition.met)).toBe(true);
    const constructed = constructPerpendicularFromTrySquare(placed);
    expect(analyzeLineConstruction(constructed)).toMatchObject({
      complete: true,
      angleAB: 90,
    });
  });

  it("przesuwa równoległą bez zmiany kierunku i prowadzi ją przez P", () => {
    const initial = createLineConstructionGeometryState(LINE_CONSTRUCTION_LESSON_SEEDS.core);
    expect(lineDirectionChangeFromReference(initial)).toBeCloseTo(0, 8);
    const throughP = setConstructionLinePose(initial, "line-b", { x: 485, y: 175 }, 28);
    expect(analyzeLineConstruction(throughP).complete).toBe(true);
    expect(lineDirectionChangeFromReference(throughP)).toBeCloseTo(0, 8);
  });

  it("sprawdza osobno trzy warunki projektu a, b, c i zwraca oba kody relacji", () => {
    const initial = createLineConstructionGeometryState(LINE_CONSTRUCTION_LESSON_SEEDS.challenge);
    expect(analyzeLineConstruction(initial).errorCodes).toEqual([
      "GEO_NOT_PARALLEL",
      "GEO_NOT_PERPENDICULAR",
    ]);
    const parallel = setConstructionLinePose(initial, "line-b", { x: 280, y: 180 }, 32);
    const complete = setConstructionLinePose(parallel, "line-c", { x: 505, y: 125 }, 122);
    expect(analyzeLineConstruction(complete).conditions.map((condition) => condition.met)).toEqual([true, true, true]);
    expect(analyzeLineConstruction(complete).complete).toBe(true);
  });
});
