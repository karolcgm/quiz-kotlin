import { describe, expect, it } from "vitest";
import {
  FRA_MIXED_NUMBER_ERROR,
  FRA_REPAIR_STEP,
  FRA_WHOLE_ASSESSMENT,
  applyDifferentDenominatorAdvancedOperation,
  createFractionDifferentDenominatorAdvancedDiagnosticResult,
  createPublicFractionDifferentDenominatorAdvancedTask,
  evaluateDifferentDenominatorAdvancedAttempt,
  leastCommonDenominatorAdvanced,
  simplifiedDifferentDenominatorAdvancedResult,
  type FractionDifferentDenominatorAdvancedAttempt,
} from "@/lib/math/fractions/fractionDifferentDenominatorAdvancedLesson";
import { FRA_DENOM_ADDED, FRA_NO_COMMON_DENOMINATOR } from "@/lib/math/fractions/fractionDifferentDenominatorMeasureLesson";
import { FRACTION_FEEDBACK_CODES } from "@/types/fractions";

function attempt(overrides: Partial<FractionDifferentDenominatorAdvancedAttempt> = {}): FractionDifferentDenominatorAdvancedAttempt {
  return {
    commonDenominator: 12,
    leftMultiplier: 4,
    rightMultiplier: 3,
    submitted: { numerator: 43, denominator: 12 },
    usedMixedFormat: true,
    submittedFractionalNumerator: 7,
    submittedFractionalDenominator: 12,
    ...overrides,
  };
}

describe("M5-3.6 L2 — działania i kontrola sensu", () => {
  it("wybiera wspólny mianownik i oblicza dodawanie", () => {
    const task = createPublicFractionDifferentDenominatorAdvancedTask({ seed: 1, difficulty: "core", activity: "different-denom-l2-subtraction-bars" });
    expect(leastCommonDenominatorAdvanced(6, 4)).toBe(12);
    expect(task.commonDenominatorOptions).toEqual([5, 6, 12]);
    expect(applyDifferentDenominatorAdvancedOperation(task)).toEqual({ numerator: 5, denominator: 6 });
    expect(simplifiedDifferentDenominatorAdvancedResult(task)).toMatchObject({ wholePart: 0, numerator: 5, denominator: 6 });
  });

  it("oblicza odejmowanie po rozszerzeniu obu ułamków", () => {
    const task = createPublicFractionDifferentDenominatorAdvancedTask({ seed: 2, difficulty: "core", activity: "different-denom-l2-mixed-number" });
    expect(simplifiedDifferentDenominatorAdvancedResult(task)).toMatchObject({ wholePart: 0, numerator: 7, denominator: 12 });
    expect(evaluateDifferentDenominatorAdvancedAttempt({ task, attempt: attempt({ leftMultiplier: 2, rightMultiplier: 3, usedMixedFormat: false, submitted: { numerator: 7, denominator: 12 }, submittedFractionalNumerator: 7 }) })).toBeNull();
  });

  it("wymaga oceny szklarni względem jednego litra", () => {
    const task = createPublicFractionDifferentDenominatorAdvancedTask({ seed: 3, difficulty: "core", activity: "different-denom-l2-greenhouse" });
    const greenhouseAttempt = attempt({ submitted: { numerator: 17, denominator: 12 }, submittedFractionalNumerator: 5, wholeAssessment: "below-one" });
    expect(evaluateDifferentDenominatorAdvancedAttempt({ task, attempt: greenhouseAttempt })).toBe(FRA_WHOLE_ASSESSMENT);
    expect(evaluateDifferentDenominatorAdvancedAttempt({ task, attempt: { ...greenhouseAttempt, wholeAssessment: "above-one" } })).toBeNull();
  });

  it("rozpoznaje dokładny krok naprawy i błąd dodawania mianowników", () => {
    const task = createPublicFractionDifferentDenominatorAdvancedTask({ seed: 4, difficulty: "core", activity: "different-denom-l2-repair" });
    const repairAttempt = attempt({ submitted: { numerator: 11, denominator: 12 }, usedMixedFormat: false, submittedFractionalNumerator: 11, repairStep: "extension" });
    expect(evaluateDifferentDenominatorAdvancedAttempt({ task, attempt: repairAttempt })).toBe(FRA_REPAIR_STEP);
    expect(evaluateDifferentDenominatorAdvancedAttempt({ task, attempt: { ...repairAttempt, repairStep: "denominator-operation" } })).toBeNull();
    expect(evaluateDifferentDenominatorAdvancedAttempt({ task, attempt: { ...repairAttempt, repairStep: "denominator-operation", submitted: { numerator: 3, denominator: 7 }, submittedFractionalNumerator: 3, submittedFractionalDenominator: 7 } })).toBe(FRA_DENOM_ADDED);
  });

  it("zachowuje diagnostykę braku wspólnej miary, skracania i konkretnych podświetleń", () => {
    const task = createPublicFractionDifferentDenominatorAdvancedTask({ seed: 5, difficulty: "core", activity: "different-denom-l2-mixed-number" });
    expect(evaluateDifferentDenominatorAdvancedAttempt({ task, attempt: attempt({ commonDenominator: null }) })).toBe(FRA_NO_COMMON_DENOMINATOR);
    expect(evaluateDifferentDenominatorAdvancedAttempt({ task, attempt: attempt({ commonDenominator: 24, leftMultiplier: 4, rightMultiplier: 6, submitted: { numerator: 14, denominator: 24 }, usedMixedFormat: false, submittedFractionalNumerator: 14, submittedFractionalDenominator: 24 }) })).toBe(FRACTION_FEEDBACK_CODES.notSimplified);
    const diagnostic = createFractionDifferentDenominatorAdvancedDiagnosticResult(FRA_REPAIR_STEP);
    expect(diagnostic.highlights[0]).toMatchObject({ pattern: "double", symbol: "≠ +" });
    expect(diagnostic.highlights[0]?.memberIds).toEqual(["repair-wrong-denominator", "repair-common-denominator"]);
  });

  it("nie ujawnia answerSpec w zadaniu publicznym i utrzymuje inwarianty poziomów", () => {
    for (const difficulty of ["support", "core", "challenge"] as const) {
      const task = createPublicFractionDifferentDenominatorAdvancedTask({ seed: 536200, difficulty, activity: "different-denom-l2-independent" });
      expect(JSON.stringify(task)).not.toContain("answerSpec");
      expect(task.left.denominator).not.toBe(task.right.denominator);
      expect(task.commonDenominatorOptions).toContain(leastCommonDenominatorAdvanced(task.left.denominator, task.right.denominator));
      expect(applyDifferentDenominatorAdvancedOperation(task).numerator).toBeGreaterThanOrEqual(0);
    }
  });
});
