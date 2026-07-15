import { describe, expect, it } from "vitest";
import {
  FRACTION_DIFFERENT_DENOMINATOR_MEASURE_GENERATOR_ID,
  FRA_DENOM_ADDED,
  FRA_DIFFERENT_EXTENSION_FACTORS,
  FRA_NO_COMMON_DENOMINATOR,
  FRA_ONE_FRACTION_EXTENDED,
  applyDifferentDenominatorOperation,
  createFractionDifferentDenominatorMeasureDiagnosticResult,
  createPublicFractionDifferentDenominatorMeasureTask,
  evaluateDifferentDenominatorMeasureAttempt,
  leastCommonDenominator,
  simplifiedDifferentDenominatorResult,
  type FractionDifferentDenominatorAttempt,
} from "@/lib/math/fractions/fractionDifferentDenominatorMeasureLesson";
import { FRACTION_FEEDBACK_CODES } from "@/types/fractions";
import type { LessonDifficulty } from "@/types/lessonPackage";

const glassTask = createPublicFractionDifferentDenominatorMeasureTask({
  seed: 36064,
  difficulty: "core",
  activity: "different-denom-algorithm",
});

const correctAttempt: FractionDifferentDenominatorAttempt = {
  commonDenominator: 12,
  leftNumeratorMultiplier: 4,
  leftDenominatorMultiplier: 4,
  rightNumeratorMultiplier: 3,
  rightDenominatorMultiplier: 3,
  submitted: { numerator: 7, denominator: 12 },
};

describe("M5-3.6 L1 — wspólna miara", () => {
  it("oblicza NWW, działanie i najprostszą postać", () => {
    expect(leastCommonDenominator(3, 4)).toBe(12);
    expect(leastCommonDenominator(4, 6)).toBe(12);
    expect(applyDifferentDenominatorOperation(glassTask)).toEqual({ numerator: 7, denominator: 12 });
    expect(simplifiedDifferentDenominatorResult({
      left: { numerator: 3, denominator: 4 },
      right: { numerator: 1, denominator: 6 },
      operation: "−",
    })).toMatchObject({ numerator: 7, denominator: 12 });
  });

  it("tworzy deterministyczne zadania publiczne bez prywatnego answerSpec", () => {
    const first = createPublicFractionDifferentDenominatorMeasureTask({ seed: 536102, difficulty: "core", activity: "different-denom-independent" });
    const second = createPublicFractionDifferentDenominatorMeasureTask({ seed: 536102, difficulty: "core", activity: "different-denom-independent" });
    expect(first).toEqual(second);
    expect(first.generatorId).toBe(FRACTION_DIFFERENT_DENOMINATOR_MEASURE_GENERATOR_ID);
    expect(first.skillIds).toHaveLength(4);
    expect(JSON.stringify(first)).not.toContain("answerSpec");
  });

  it.each<LessonDifficulty>(["support", "core", "challenge"])("utrzymuje inwarianty ułamków właściwych dla poziomu %s", (difficulty) => {
    for (let seed = 1; seed <= 40; seed += 1) {
      const task = createPublicFractionDifferentDenominatorMeasureTask({ seed, difficulty, activity: "different-denom-independent" });
      const result = applyDifferentDenominatorOperation(task);
      expect(task.left.denominator).not.toBe(task.right.denominator);
      expect(task.left.numerator).toBeLessThan(task.left.denominator);
      expect(task.right.numerator).toBeLessThan(task.right.denominator);
      expect(result.numerator).toBeGreaterThanOrEqual(0);
      expect(result.numerator).toBeLessThan(result.denominator);
      expect(task.commonDenominatorOptions).toContain(leastCommonDenominator(task.left.denominator, task.right.denominator));
    }
  });

  it("rozróżnia wszystkie kluczowe błędy zamiast zwracać ogólne niepoprawnie", () => {
    expect(evaluateDifferentDenominatorMeasureAttempt({ task: glassTask, attempt: { ...correctAttempt, commonDenominator: null } })).toBe(FRA_NO_COMMON_DENOMINATOR);
    expect(evaluateDifferentDenominatorMeasureAttempt({ task: glassTask, attempt: {
      ...correctAttempt,
      rightNumeratorMultiplier: 1,
      rightDenominatorMultiplier: 1,
    } })).toBe(FRA_ONE_FRACTION_EXTENDED);
    expect(evaluateDifferentDenominatorMeasureAttempt({ task: glassTask, attempt: {
      ...correctAttempt,
      leftDenominatorMultiplier: 3,
    } })).toBe(FRA_DIFFERENT_EXTENSION_FACTORS);
    expect(evaluateDifferentDenominatorMeasureAttempt({ task: glassTask, attempt: {
      ...correctAttempt,
      submitted: { numerator: 2, denominator: 7 },
    } })).toBe(FRA_DENOM_ADDED);
    expect(evaluateDifferentDenominatorMeasureAttempt({ task: glassTask, attempt: {
      ...correctAttempt,
      commonDenominator: 24,
      leftNumeratorMultiplier: 8,
      leftDenominatorMultiplier: 8,
      rightNumeratorMultiplier: 6,
      rightDenominatorMultiplier: 6,
      submitted: { numerator: 14, denominator: 24 },
    } })).toBe(FRACTION_FEEDBACK_CODES.notSimplified);
    expect(evaluateDifferentDenominatorMeasureAttempt({ task: glassTask, attempt: correctAttempt })).toBeNull();
  });

  it("buduje wskazówki i podświetlenia przypisane do konkretnych kratek", () => {
    const common = createFractionDifferentDenominatorMeasureDiagnosticResult(FRA_NO_COMMON_DENOMINATOR);
    expect(common.result.errorCodes).toEqual([FRA_NO_COMMON_DENOMINATOR]);
    expect(common.highlights[0]?.memberIds).toEqual(["common-denominator-left", "common-denominator-right"]);

    const factors = createFractionDifferentDenominatorMeasureDiagnosticResult(FRA_DIFFERENT_EXTENSION_FACTORS);
    expect(factors.copy.guidingQuestion).toContain("mnożnik");
    expect(factors.highlights[0]).toMatchObject({ pattern: "double", symbol: "×≠" });
  });
});
