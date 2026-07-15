import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  VERTICAL_ANGLES_LESSON_SEEDS,
  anglePairInvariant,
  atomicIntersectionSectors,
  createPublicVerticalAnglesTask,
  createVerticalAnglesGeometryState,
  intersectionLineDirection,
  intersectionSectorsForPair,
  isVerticalAnglesLessonSeed,
  moveIntersectionLineHandle,
  relationForAnglePair,
  setIntersectionLineDirection,
} from "@/lib/math/geometry/verticalAngles";

describe("WP-S4-04 — matematyka kątów przyległych i wierzchołkowych", () => {
  it("generuje deterministycznie wszystkie historie i poziomy w odseparowanej przestrzeni seedów", () => {
    for (const activity of ["crossing", "pairs", "one-angle", "three-lines", "roundabout", "repair", "independent"] as const) {
      for (const difficulty of ["support", "core", "challenge"] as const) {
        const seed = VERTICAL_ANGLES_LESSON_SEEDS[activity][difficulty];
        const task = createPublicVerticalAnglesTask(seed);
        expect(createPublicVerticalAnglesTask(seed)).toEqual(task);
        expect(task).toMatchObject({ activity, difficulty, generatorId: "geometry-vertical-adjacent-l1-v1", generatorVersion: 1 });
        expect(task.invariants).toEqual(expect.arrayContaining([
          "vertical-pairs-have-equal-measures",
          "adjacent-linear-pairs-sum-to-180-degrees",
          "pair-marking-never-uses-color-alone",
          "four-measures-update-in-real-time",
          "touch-target-52-px",
          "answer-spec-server-only",
        ]));
        expect(task).not.toHaveProperty("answerSpec");
        expect(isVerticalAnglesLessonSeed(seed)).toBe(true);
      }
    }
    expect(isVerticalAnglesLessonSeed(440100)).toBe(false);
    expect(isVerticalAnglesLessonSeed(440204)).toBe(false);
    expect(isVerticalAnglesLessonSeed(431401)).toBe(false);
  });

  it("zachowuje równość par wierzchołkowych i sumę 180° par przyległych w wielu położeniach", () => {
    let state = createVerticalAnglesGeometryState(VERTICAL_ANGLES_LESSON_SEEDS.crossing.support);
    for (const direction of [17, 63, 121, 208, 319]) {
      state = setIntersectionLineDirection(state, "b", direction);
      const sectors = intersectionSectorsForPair(state);
      expect(sectors).toHaveLength(4);
      expect(sectors.reduce((sum, sector) => sum + sector.measureDegrees, 0)).toBeCloseTo(360, 7);
      expect(anglePairInvariant(state, 0, 2)).toMatchObject({ relation: "vertical", equal: true });
      expect(anglePairInvariant(state, 1, 3)).toMatchObject({ relation: "vertical", equal: true });
      expect(anglePairInvariant(state, 0, 1)).toMatchObject({ relation: "adjacent", sumDegrees: 180 });
      expect(anglePairInvariant(state, 3, 0)).toMatchObject({ relation: "adjacent", sumDegrees: 180 });
    }
    expect(relationForAnglePair(0, 2)).toBe("vertical");
    expect(relationForAnglePair(0, 1)).toBe("adjacent");
    expect(relationForAnglePair(1, 1)).toBe("neither");
  });

  it("aktualizuje miary z kierunku, przeciągnięcia i współrzędnych bez utraty prostoliniowości", () => {
    const initial = createVerticalAnglesGeometryState(VERTICAL_ANGLES_LESSON_SEEDS.crossing.core);
    const before = intersectionSectorsForPair(initial).map((sector) => sector.measureDegrees);
    const rotated = setIntersectionLineDirection(initial, "b", intersectionLineDirection(initial, "b") + 11);
    const afterRotation = intersectionSectorsForPair(rotated).map((sector) => sector.measureDegrees);
    const moved = moveIntersectionLineHandle(rotated, "b", { x: 650, y: 140 });
    const afterMove = intersectionSectorsForPair(moved).map((sector) => sector.measureDegrees);
    expect(afterRotation).not.toEqual(before);
    expect(afterMove).not.toEqual(afterRotation);
    expect(afterMove[0]).toBeCloseTo(afterMove[2]!, 7);
    expect(afterMove[0]! + afterMove[1]!).toBeCloseTo(180, 7);
  });

  it("dla trzech prostych tworzy sześć sektorów, ale własności liczy dla wybranej pary", () => {
    const state = createVerticalAnglesGeometryState(VERTICAL_ANGLES_LESSON_SEEDS["three-lines"].challenge);
    expect(atomicIntersectionSectors(state)).toHaveLength(6);
    for (const pair of [["a", "b"], ["a", "c"], ["b", "c"]] as const) {
      const sectors = intersectionSectorsForPair(state, pair);
      expect(sectors).toHaveLength(4);
      expect(sectors[0]!.measureDegrees).toBeCloseTo(sectors[2]!.measureDegrees, 7);
      expect(sectors[0]!.measureDegrees + sectors[1]!.measureDegrees).toBeCloseTo(180, 7);
    }
  });

  it("utrzymuje pary, oczekiwane miary i punktację wyłącznie w module server-only", () => {
    const serverSource = readFileSync(new URL("./verticalAngles.server.ts", import.meta.url), "utf8");
    const publicSource = readFileSync(new URL("./verticalAngles.ts", import.meta.url), "utf8");
    expect(serverSource).toContain('import "server-only"');
    expect(serverSource).toContain("answerSpec");
    expect(serverSource).toContain("verticalPairs");
    expect(serverSource).toContain("adjacentPairs");
    expect(serverSource).toContain("justification: 1");
    expect(publicSource).not.toContain("answerSpec:");
    expect(publicSource).not.toContain("expectedMeasuresDegrees:");
  });
});
