import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  FRACTION_SAME_DENOMINATOR_MIXED_FEEDBACK_KEYS,
  FRA_BORROW_WHOLE,
  FRA_UNSIMPLIFIED_RESULT,
  applyMixedSameDenominatorOperation,
  createFractionSameDenominatorMixedDiagnosticResult,
  createPublicFractionSameDenominatorMixedTask,
  evaluateMixedSameDenominatorAttempt,
  exchangeOneWhole,
  fractionSameDenominatorMixedActivityFromStageId,
  mixedResultWithSameDenominator,
  requiresWholeExchange,
  simplifiedMixedResult,
} from "@/lib/math/fractions/fractionSameDenominatorMixedLesson";

describe("WP-S3-05B — generator i walidator liczb mieszanych", () => {
  it("utrwala dokładne 4 3/8 − 1 5/8 i zamianę całości na osiem ósmych", () => {
    const task = createPublicFractionSameDenominatorMixedTask({ seed: 1, difficulty: "core", activity: "mixed-same-denom-borrow-pizza" });
    const problem = task.problems[0]!;
    expect(problem).toMatchObject({
      left: { wholePart: 4, numerator: 3, denominator: 8 },
      right: { wholePart: 1, numerator: 5, denominator: 8 },
      operation: "−",
    });
    expect(requiresWholeExchange(problem)).toBe(true);
    expect(exchangeOneWhole(problem.left)).toEqual({ wholePart: 3, numerator: 11, denominator: 8 });
    expect(mixedResultWithSameDenominator(problem)).toEqual({ wholePart: 2, numerator: 6, denominator: 8 });
    expect(simplifiedMixedResult(problem)).toEqual({ wholePart: 2, numerator: 3, denominator: 4 });
    expect(task).not.toHaveProperty("answerSpec");
  });

  it("generuje deterministyczne, nieujemne warianty support/core/challenge", () => {
    for (const difficulty of ["support", "core", "challenge"] as const) {
      for (let seed = 0; seed < 80; seed += 1) {
        const first = createPublicFractionSameDenominatorMixedTask({ seed, difficulty, activity: "mixed-same-denom-independent" });
        const second = createPublicFractionSameDenominatorMixedTask({ seed, difficulty, activity: "mixed-same-denom-independent" });
        expect(second).toEqual(first);
        const problem = first.problems[0]!;
        expect(problem.left.denominator).toBe(problem.right.denominator);
        expect(problem.left.numerator).toBeLessThan(problem.left.denominator);
        expect(problem.right.numerator).toBeLessThan(problem.right.denominator);
        expect(applyMixedSameDenominatorOperation(problem).numerator).toBeGreaterThanOrEqual(0);
        expect(first).not.toHaveProperty("answerSpec");
      }
    }
  });

  it("nie powtarza działań w pięciozadaniowej serii klasy 6", () => {
    const series = [
      { seed: 35520, difficulty: "core" },
      { seed: 35521, difficulty: "core" },
      { seed: 35522, difficulty: "core" },
      { seed: 35523, difficulty: "challenge" },
      { seed: 35524, difficulty: "challenge" },
    ] as const;
    const signatures = series.map(({ seed, difficulty }) => {
      const problem = createPublicFractionSameDenominatorMixedTask({
        seed,
        difficulty,
        activity: "mixed-same-denom-independent",
      }).problems[0]!;
      return [
        problem.left.wholePart,
        problem.left.numerator,
        problem.left.denominator,
        problem.operation,
        problem.right.wholePart,
        problem.right.numerator,
        problem.right.denominator,
      ].join(":");
    });

    expect(new Set(signatures).size).toBe(series.length);
  });

  it("rozróżnia brak zamiany całości od poprawnej, lecz nieskróconej wartości", () => {
    const task = createPublicFractionSameDenominatorMixedTask({ seed: 1, difficulty: "core", activity: "mixed-same-denom-borrow-notation" });
    const problem = task.problems[0]!;
    expect(evaluateMixedSameDenominatorAttempt({
      problem,
      submitted: applyMixedSameDenominatorOperation(problem),
      exchangedWhole: false,
    })).toBe(FRA_BORROW_WHOLE);
    expect(evaluateMixedSameDenominatorAttempt({
      problem,
      submitted: applyMixedSameDenominatorOperation(problem),
      exchangedWhole: true,
    })).toBe(FRA_UNSIMPLIFIED_RESULT);
    expect(evaluateMixedSameDenominatorAttempt({
      problem,
      submitted: { numerator: 11, denominator: 4 },
      exchangedWhole: true,
      justification: "Zamieniłem jedną całość na osiem ósmych części, bo 3/8 nie wystarczało.",
      requireJustification: true,
    })).toBeNull();
    expect(createFractionSameDenominatorMixedDiagnosticResult(FRA_BORROW_WHOLE).result)
      .toMatchObject({ status: "incorrect", score: 0, maxScore: 2 });
    expect(createFractionSameDenominatorMixedDiagnosticResult(FRA_UNSIMPLIFIED_RESULT).result)
      .toMatchObject({ status: "partially-correct", score: 1, maxScore: 2 });
  });

  it("mapuje pięć unikalnych aktywności i publikuje wymagane kody feedbacku", () => {
    const activities = [
      "mixed-same-denom-add",
      "mixed-same-denom-borrow-pizza",
      "mixed-same-denom-borrow-notation",
      "mixed-same-denom-bakery",
      "mixed-same-denom-independent",
    ] as const;
    expect(activities.map((activity) => fractionSameDenominatorMixedActivityFromStageId(`m5-3-5-${activity}`)))
      .toEqual(activities);
    expect(FRACTION_SAME_DENOMINATOR_MIXED_FEEDBACK_KEYS).toEqual(expect.arrayContaining([
      FRA_BORROW_WHOLE,
      FRA_UNSIMPLIFIED_RESULT,
      "FRA_WRONG_OPERATION_PAIR",
    ]));
  });

  it("trzyma prywatną rubrykę wyłącznie w module server-only", () => {
    const publicModule = readFileSync(resolve(process.cwd(), "src/lib/math/fractions/fractionSameDenominatorMixedLesson.ts"), "utf8");
    const serverModule = readFileSync(resolve(process.cwd(), "src/lib/math/fractions/fractionSameDenominatorMixedLesson.server.ts"), "utf8");
    expect(publicModule).not.toContain("expectedBeforeSimplifying:");
    expect(serverModule).toContain('import "server-only"');
    expect(serverModule).toContain("expectedBeforeSimplifying");
    expect(serverModule).toContain("exchangeTrace");
  });
});
