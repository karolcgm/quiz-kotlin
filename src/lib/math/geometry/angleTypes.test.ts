import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  ANGLE_TYPES_LESSON_SEEDS,
  angleArmLengths,
  angleMeasureDegrees,
  angleRotationDegrees,
  classifyAngleDegrees,
  classifyAngleState,
  createAngleTypesGeometryState,
  createPublicAngleTypesTask,
  isAngleTypesLessonSeed,
  rotateWholeAngleBy,
  setAngleArmLength,
  setAngleMeasure,
} from "@/lib/math/geometry/angleTypes";
import { serializeGeometryState } from "@/lib/math/geometry/geometryState";

describe("WP-S4-02A — matematyka kątów L1", () => {
  it("generuje deterministyczne konfiguracje Start/Dalej/Wyzwanie bez answerSpec", () => {
    for (const difficulty of ["support", "core", "challenge"] as const) {
      const seed = ANGLE_TYPES_LESSON_SEEDS.independent[difficulty];
      const first = createPublicAngleTypesTask(seed);
      expect(createPublicAngleTypesTask(seed)).toEqual(first);
      expect(first.difficulty).toBe(difficulty);
      expect(first.generatorId).toBe("geometry-angle-types-l1-v1");
      expect(first.invariants).toContain("answer-spec-server-only");
      expect(first).not.toHaveProperty("answerSpec");
      expect(isAngleTypesLessonSeed(seed)).toBe(true);
    }
    expect(isAngleTypesLessonSeed(420604)).toBe(false);
    expect(isAngleTypesLessonSeed(411301)).toBe(false);
  });

  it("rozstrzyga dokładnie bramki 89°/90°/91°/180°", () => {
    expect(classifyAngleDegrees(89)).toBe("acute");
    expect(classifyAngleDegrees(90)).toBe("right");
    expect(classifyAngleDegrees(91)).toBe("obtuse");
    expect(classifyAngleDegrees(180)).toBe("straight");
  });

  it("aktualizuje klasyfikację z bieżących współrzędnych", () => {
    const state = createAngleTypesGeometryState(ANGLE_TYPES_LESSON_SEEDS.gates.support);
    expect(angleMeasureDegrees(state)).toBe(89);
    expect(classifyAngleState(state)).toBe("acute");
    const right = setAngleMeasure(state, 90);
    expect(angleMeasureDegrees(right)).toBe(90);
    expect(classifyAngleState(right)).toBe("right");
    expect(JSON.parse(serializeGeometryState(right))).toMatchObject({ version: 1, mode: "practice" });
  });

  it("obrót całej figury nie zmienia miary ani klasyfikacji", () => {
    const state = createAngleTypesGeometryState(ANGLE_TYPES_LESSON_SEEDS.predict.challenge);
    const rotated = rotateWholeAngleBy(state, 137);
    expect(angleRotationDegrees(rotated)).not.toBe(angleRotationDegrees(state));
    expect(angleMeasureDegrees(rotated)).toBe(angleMeasureDegrees(state));
    expect(classifyAngleState(rotated)).toBe(classifyAngleState(state));
  });

  it("długość ramion nie zmienia kąta", () => {
    const state = createAngleTypesGeometryState(ANGLE_TYPES_LESSON_SEEDS["length-invariance"].support);
    const changed = setAngleArmLength(setAngleArmLength(state, "first", 80), "second", 235);
    expect(angleArmLengths(changed).first).toBeCloseTo(80, 8);
    expect(angleArmLengths(changed).second).toBeCloseTo(235, 8);
    expect(angleMeasureDegrees(changed)).toBe(angleMeasureDegrees(state));
    expect(classifyAngleState(changed)).toBe(classifyAngleState(state));
  });

  it("utrzymuje prywatną rubrykę za granicą server-only", () => {
    const source = readFileSync(new URL("./angleTypes.server.ts", import.meta.url), "utf8");
    expect(source).toContain('import "server-only"');
    expect(source).toContain("answerSpec");
    expect(readFileSync(new URL("./angleTypes.ts", import.meta.url), "utf8")).not.toContain("expectedKind,");
  });
});
