import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  FRACTION_QUOTIENT_CONTEXT_CODE,
  FRACTION_QUOTIENT_FEEDBACK_KEYS,
  FRACTION_QUOTIENT_ORDER_CODE,
  FRACTION_UNEQUAL_SHARING_CODE,
  FRACTION_UNUSED_PARTS_CODE,
  createFractionQuotientDiagnosticResult,
  createPublicFractionQuotientTask,
  fractionQuotientActivityFromStageId,
  quotientFraction,
  quotientMixedNumber,
  validateFairShare,
  validateQuotientNotation,
} from "@/lib/math/fractions/fractionQuotientLesson";

describe("WP-S3-02 — matematyka i generator Ułamek jako iloraz", () => {
  it("generuje deterministyczne, dodatnie dzielniki dla trzech poziomów bez answerSpec", () => {
    for (const difficulty of ["support", "core", "challenge"] as const) {
      for (let seed = 0; seed < 1000; seed += 1) {
        const first = createPublicFractionQuotientTask({ seed, difficulty, activity: "realtime-quotient" });
        const second = createPublicFractionQuotientTask({ seed, difficulty, activity: "realtime-quotient" });
        expect(second).toEqual(first);
        expect(first.divisor).toBeGreaterThan(0);
        expect(first.quotient?.denominator).toBe(first.divisor);
        expect(first.mixed?.denominator).toBe(first.divisor);
        expect(first).not.toHaveProperty("answerSpec");
      }
    }
  });

  it("utrwala sytuacje 5:2, 5:0, 11:4 i 13:6 bez tworzenia ułamka z mianownikiem zero", () => {
    const fair = createPublicFractionQuotientTask({ seed: 1, difficulty: "core", activity: "fair-share" });
    const zero = createPublicFractionQuotientTask({ seed: 1, difficulty: "core", activity: "zero-divisor" });
    const zoo = createPublicFractionQuotientTask({ seed: 1, difficulty: "core", activity: "zoo-banquet" });
    const independent = createPublicFractionQuotientTask({ seed: 1, difficulty: "core", activity: "independent-context" });
    expect(fair).toMatchObject({ dividend: 5, divisor: 2, quotient: { numerator: 5, denominator: 2 }, mixed: { wholePart: 2, numerator: 1, denominator: 2 } });
    expect(zero).toMatchObject({ dividend: 5, divisor: 0, quotient: null, mixed: null });
    expect(zoo).toMatchObject({ dividend: 11, divisor: 4, quotient: { numerator: 11, denominator: 4 }, mixed: { wholePart: 2, numerator: 3, denominator: 4 } });
    expect(independent).toMatchObject({ dividend: 13, divisor: 6, quotient: { numerator: 13, denominator: 6 }, mixed: { wholePart: 2, numerator: 1, denominator: 6 } });
    expect(quotientFraction(5, 0)).toBeNull();
    expect(quotientMixedNumber(13, 6)).toEqual({ wholePart: 2, numerator: 1, denominator: 6 });
  });

  it("rozróżnia niewykorzystane części, nierówny podział i kompletny równy podział", () => {
    expect(validateFairShare([0, 1, null, null], 2, 2)).toMatchObject({ status: "incorrect", code: FRACTION_UNUSED_PARTS_CODE, unassigned: 2 });
    expect(validateFairShare([0, 0, 0, 1], 2, 2)).toMatchObject({ status: "incorrect", code: FRACTION_UNEQUAL_SHARING_CODE, counts: [3, 1] });
    expect(validateFairShare([0, 1, 0, 1], 2, 2)).toEqual({ status: "correct", counts: [2, 2] });
  });

  it("sprawdza dokładną kolejność a:b=a/b, nie tylko równoważną wartość", () => {
    expect(validateQuotientNotation(5, 2, { numerator: 5, denominator: 2 })).toBeNull();
    expect(validateQuotientNotation(5, 2, { numerator: 2, denominator: 5 })).toBe(FRACTION_QUOTIENT_ORDER_CODE);
    expect(validateQuotientNotation(5, 2, { numerator: 10, denominator: 4 })).toBe(FRACTION_QUOTIENT_CONTEXT_CODE);
    expect(validateQuotientNotation(5, 0, { numerator: 5, denominator: 1 })).toBe("FRA_ZERO_DENOMINATOR");
  });

  it("mapuje sześć etapów i publikuje pełny zestaw wymaganej diagnostyki", () => {
    expect(fractionQuotientActivityFromStageId("m5-3-2-quotient-fair-share")).toBe("fair-share");
    expect(fractionQuotientActivityFromStageId("m5-3-2-quotient-two-notations")).toBe("two-notations");
    expect(fractionQuotientActivityFromStageId("m5-3-2-quotient-realtime")).toBe("realtime-quotient");
    expect(fractionQuotientActivityFromStageId("m5-3-2-quotient-zero")).toBe("zero-divisor");
    expect(fractionQuotientActivityFromStageId("m5-3-2-quotient-zoo-banquet")).toBe("zoo-banquet");
    expect(fractionQuotientActivityFromStageId("m5-3-2-quotient-independent")).toBe("independent-context");
    expect(FRACTION_QUOTIENT_FEEDBACK_KEYS).toEqual(expect.arrayContaining([
      FRACTION_QUOTIENT_ORDER_CODE,
      FRACTION_UNEQUAL_SHARING_CODE,
      FRACTION_UNUSED_PARTS_CODE,
      "FRA_ZERO_DENOMINATOR",
    ]));
    expect(createFractionQuotientDiagnosticResult(FRACTION_UNEQUAL_SHARING_CODE)).toMatchObject({
      result: { status: "partially-correct", errorCodes: [FRACTION_UNEQUAL_SHARING_CODE] },
      highlights: [{ symbol: "≠", state: "attention" }],
    });
  });

  it("trzyma pełny klucz i rubrykę wyłącznie w module server-only", () => {
    const serverModule = readFileSync(resolve(process.cwd(), "src/lib/math/fractions/fractionQuotientLesson.server.ts"), "utf8");
    expect(serverModule).toContain('import "server-only"');
    expect(serverModule).toContain("expectedQuotient");
    expect(serverModule).toContain("requireContextInterpretation");
  });
});
