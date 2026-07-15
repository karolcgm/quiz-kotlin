import { describe, expect, it } from "vitest";
import {
  createPublicFractionLessonL1Task,
  fractionLessonL1ActivityFromStageId,
  fractionPartitionAttempt,
  fractionWholesMatch,
  isEqualFractionPartition,
  isFractionPointOnTick,
  snapFractionPointToNumerator,
} from "@/lib/math/fractions/fractionLessonL1";

describe("WP-S3-01A — matematyka L1", () => {
  it("generuje deterministycznie trzy neutralne poziomy bez prywatnego answerSpec", () => {
    for (const difficulty of ["support", "core", "challenge"] as const) {
      const first = createPublicFractionLessonL1Task({ seed: 53101, difficulty, activity: "independent" });
      const second = createPublicFractionLessonL1Task({ seed: 53101, difficulty, activity: "independent" });
      expect(first).toEqual(second);
      expect(first.generatorId).toBe("fraction-lesson-l1-v1");
      expect(first.allowedDenominators).toEqual([2, 3, 4, 6, 8]);
      expect(first.target.numerator).toBeGreaterThan(0);
      expect(first.target.numerator).toBeLessThanOrEqual(first.target.denominator);
      expect(first).not.toHaveProperty("answerSpec");
    }
  });

  it("odróżnia równe części od nierównego podziału", () => {
    expect(isEqualFractionPartition(fractionPartitionAttempt(4, 0))).toBe(true);
    expect(isEqualFractionPartition(fractionPartitionAttempt(4, 20))).toBe(false);
    expect(() => fractionPartitionAttempt(5, 0)).toThrow(/2, 3, 4, 6 albo 8/u);
  });

  it("pilnuje tej samej całości", () => {
    expect(fractionWholesMatch(1, 1)).toBe(true);
    expect(fractionWholesMatch(1, 0.75)).toBe(false);
  });

  it("rozpoznaje 1/2, położenie między kreskami i przyciąga punkt do podziałki", () => {
    expect(isFractionPointOnTick(1 / 2, 2)).toBe(true);
    expect(isFractionPointOnTick(0.41, 4)).toBe(false);
    expect(snapFractionPointToNumerator(0.41, 4)).toBe(2);
    expect(snapFractionPointToNumerator(1.2, 4)).toBe(4);
  });

  it("mapuje wyłącznie pięć etapów L1", () => {
    expect(fractionLessonL1ActivityFromStageId("m5-3-1-l1-same-whole")).toBe("same-whole");
    expect(fractionLessonL1ActivityFromStageId("m5-3-1-l1-model-notation")).toBe("model-notation");
    expect(fractionLessonL1ActivityFromStageId("m5-3-1-l1-parts-meaning")).toBe("parts-meaning");
    expect(fractionLessonL1ActivityFromStageId("m5-3-1-l1-fraction-axis")).toBe("number-line");
    expect(fractionLessonL1ActivityFromStageId("m5-3-1-l1-independent")).toBe("independent");
  });
});
