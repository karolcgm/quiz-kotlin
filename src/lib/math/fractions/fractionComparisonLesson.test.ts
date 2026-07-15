import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  FRACTION_COMPARISON_FEEDBACK_KEYS,
  FRACTION_COMPARISON_JUSTIFICATION_CODE,
  FRACTION_COMPARISON_ORDER_CODE,
  FRACTION_COMPARISON_STRATEGY_CODE,
  FRACTION_COMPARISON_WRONG_SIGN_CODE,
  commonDenominatorEvidence,
  commonNumeratorEvidence,
  compareFractions,
  comparisonSign,
  createFractionComparisonDiagnosticResult,
  createPublicFractionComparisonTask,
  evaluateComparisonAttempt,
  evaluateFractionOrderAttempt,
  fractionComparisonActivityFromStageId,
  sortFractionsAscending,
} from "@/lib/math/fractions/fractionComparisonLesson";

describe("WP-S3-04 — generator i walidatory porównywania ułamków", () => {
  it("generuje deterministyczne warianty support/core/challenge bez answerSpec i metody różnicowej w bazie", () => {
    for (const difficulty of ["support", "core", "challenge"] as const) {
      for (let seed = 0; seed < 500; seed += 1) {
        const first = createPublicFractionComparisonTask({ seed, difficulty, activity: "independent-comparison" });
        const second = createPublicFractionComparisonTask({ seed, difficulty, activity: "independent-comparison" });
        expect(second).toEqual(first);
        expect(first.fractions).toHaveLength(3);
        expect(first.fractions.every((value) => value.denominator > 0)).toBe(true);
        expect(first.invariants).toContain("difference-method-not-required-in-base");
        expect(first).not.toHaveProperty("answerSpec");
      }
    }
  });

  it("utrwala wszystkie historie i dokładne pary 3/4–5/8, 2/3–3/5, 1/8–1/6 oraz drony", () => {
    expect(createPublicFractionComparisonTask({ seed: 1, difficulty: "core", activity: "overlay-bars" }).fractions)
      .toEqual([{ numerator: 3, denominator: 4 }, { numerator: 5, denominator: 8 }]);
    expect(createPublicFractionComparisonTask({ seed: 1, difficulty: "core", activity: "common-axis" }).fractions)
      .toEqual([{ numerator: 2, denominator: 3 }, { numerator: 3, denominator: 5 }]);
    expect(createPublicFractionComparisonTask({ seed: 1, difficulty: "core", activity: "denominator-trap" }))
      .toMatchObject({ fractions: [{ numerator: 1, denominator: 8 }, { numerator: 1, denominator: 6 }], recommendedStrategy: "common-numerator" });
    expect(createPublicFractionComparisonTask({ seed: 1, difficulty: "core", activity: "drone-race" }).fractions)
      .toEqual([{ numerator: 1, denominator: 2 }, { numerator: 4, denominator: 7 }, { numerator: 5, denominator: 8 }]);
  });

  it("porównuje dokładnie przez BigInt, sortuje i wylicza wspólny mianownik lub licznik", () => {
    expect(compareFractions({ numerator: 2, denominator: 3 }, { numerator: 3, denominator: 5 })).toBe(1);
    expect(comparisonSign({ numerator: 4, denominator: 6 }, { numerator: 2, denominator: 3 })).toBe("=");
    expect(commonDenominatorEvidence({ numerator: 3, denominator: 4 }, { numerator: 5, denominator: 8 }))
      .toEqual({ denominator: 8, leftNumerator: 6, rightNumerator: 5 });
    expect(commonNumeratorEvidence({ numerator: 1, denominator: 8 }, { numerator: 1, denominator: 6 }))
      .toEqual({ numerator: 1, leftDenominator: 8, rightDenominator: 6 });
    expect(sortFractionsAscending([{ numerator: 5, denominator: 8 }, { numerator: 1, denominator: 2 }, { numerator: 4, denominator: 7 }]))
      .toEqual([{ numerator: 1, denominator: 2 }, { numerator: 4, denominator: 7 }, { numerator: 5, denominator: 8 }]);
  });

  it("rozróżnia niewspólną całość, zły znak oraz poprawną wartość ze złym uzasadnieniem", () => {
    const left = { numerator: 3, denominator: 4 };
    const right = { numerator: 5, denominator: 8 };
    expect(evaluateComparisonAttempt({ left, right, sign: ">", sameWhole: false })).toBe("FRA_WHOLE_MISMATCH");
    expect(evaluateComparisonAttempt({ left, right, sign: "<", sameWhole: true })).toBe(FRACTION_COMPARISON_WRONG_SIGN_CODE);
    expect(evaluateComparisonAttempt({ left, right, sign: ">", sameWhole: true, strategy: "common-denominator", reason: "bo tak" }))
      .toBe(FRACTION_COMPARISON_JUSTIFICATION_CODE);
    expect(evaluateComparisonAttempt({ left, right, sign: ">", sameWhole: true, strategy: "common-denominator", reason: "Wspólny mianownik 8 daje liczniki 6 i 5." }))
      .toBeNull();
    expect(createFractionComparisonDiagnosticResult(FRACTION_COMPARISON_JUSTIFICATION_CODE).result)
      .toMatchObject({ status: "partially-correct", score: 1, maxScore: 2 });
  });

  it("sprawdza porządek trzech wartości i mapuje sześć lokalnych aktywności przed generycznym independent", () => {
    const values = [{ numerator: 1, denominator: 2 }, { numerator: 4, denominator: 7 }, { numerator: 5, denominator: 8 }];
    expect(evaluateFractionOrderAttempt(values, [0, 1, 2])).toBeNull();
    expect(evaluateFractionOrderAttempt(values, [2, 0, 1])).toBe(FRACTION_COMPARISON_ORDER_CODE);
    expect([
      "compare-overlay-bars",
      "compare-common-axis",
      "compare-shortest-strategy",
      "compare-denominator-trap",
      "compare-drone-race",
      "compare-independent",
    ].map((suffix) => fractionComparisonActivityFromStageId(`m5-3-4-${suffix}`)))
      .toEqual(["overlay-bars", "common-axis", "shortest-strategy", "denominator-trap", "drone-race", "independent-comparison"]);
  });

  it("publikuje pełny feedback i trzyma prywatną rubrykę wyłącznie w module server-only", () => {
    expect(FRACTION_COMPARISON_FEEDBACK_KEYS).toEqual(expect.arrayContaining([
      "FRA_WHOLE_MISMATCH",
      FRACTION_COMPARISON_WRONG_SIGN_CODE,
      FRACTION_COMPARISON_JUSTIFICATION_CODE,
      FRACTION_COMPARISON_ORDER_CODE,
      FRACTION_COMPARISON_STRATEGY_CODE,
    ]));
    const publicModule = readFileSync(resolve(process.cwd(), "src/lib/math/fractions/fractionComparisonLesson.ts"), "utf8");
    const serverModule = readFileSync(resolve(process.cwd(), "src/lib/math/fractions/fractionComparisonLesson.server.ts"), "utf8");
    expect(publicModule).not.toContain("expectedAscendingOrder:");
    expect(serverModule).toContain('import "server-only"');
    expect(serverModule).toContain("expectedAscendingOrder");
    expect(serverModule).toContain("differenceMethodAcceptedAsExtensionOnly");
  });
});
