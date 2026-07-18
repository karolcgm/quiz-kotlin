import { describe, expect, it } from "vitest";
import {
  TRIANGLE_CONSTRUCTION_LESSON_SEEDS,
  analyzeTriangleSideLengths,
  createPublicTriangleConstructionTask,
  isTriangleConstructionLessonSeed,
  triangleVertexFromSides,
} from "@/lib/math/geometry/triangleConstruction";

describe("M5-4.7 — matematyka konstrukcji trójkąta", () => {
  it("odróżnia przypadek możliwy, zdegenerowany i niemożliwy", () => {
    expect(analyzeTriangleSideLengths([3, 4, 5])).toMatchObject({ possible: true, relation: "greater", shortSum: 7, longest: 5, intersectionCount: 2 });
    expect(analyzeTriangleSideLengths([4, 5, 9])).toMatchObject({ possible: false, relation: "equal", closureDifference: 0, intersectionCount: 1 });
    expect(analyzeTriangleSideLengths([2, 3, 6])).toMatchObject({ possible: false, relation: "less", closureDifference: 1, intersectionCount: 0 });
  });

  it("jest niezależny od kolejności podania boków", () => {
    expect(analyzeTriangleSideLengths([8, 4, 5])).toMatchObject({ sorted: [4, 5, 8], possible: true, shortSum: 9, longest: 8 });
    expect(analyzeTriangleSideLengths([4, 5, 8])).toMatchObject({ sorted: [4, 5, 8], possible: true, shortSum: 9, longest: 8 });
  });

  it("tworzy dwa symetryczne położenia trzeciego wierzchołka tylko dla poprawnego trójkąta", () => {
    const possible = triangleVertexFromSides([5, 5, 6], 20);
    expect(possible.upper).not.toBeNull();
    expect(possible.lower).not.toBeNull();
    expect(possible.upper?.x).toBeCloseTo(possible.lower?.x ?? 0);
    expect((possible.upper?.y ?? 0) + (possible.lower?.y ?? 0)).toBeCloseTo(640);
    expect(triangleVertexFromSides([2, 3, 6], 20).upper).toBeNull();
  });

  it("generuje deterministyczne publiczne zadania bez answerSpec", () => {
    for (const groups of Object.values(TRIANGLE_CONSTRUCTION_LESSON_SEEDS)) {
      for (const seed of Object.values(groups)) {
        const first = createPublicTriangleConstructionTask(seed);
        expect(createPublicTriangleConstructionTask(seed)).toEqual(first);
        expect(first).toMatchObject({ generatorId: "geometry-triangle-construction-v1", generatorVersion: 1, seed });
        expect(JSON.stringify(first)).not.toContain("answerSpec");
        expect(isTriangleConstructionLessonSeed(seed)).toBe(true);
      }
    }
    expect(isTriangleConstructionLessonSeed(470000)).toBe(false);
    expect(isTriangleConstructionLessonSeed(470604)).toBe(false);
    expect(isTriangleConstructionLessonSeed(470804)).toBe(false);
  });
});
