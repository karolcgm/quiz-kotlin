import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  FRACTION_DIFFERENT_FACTORS_CODE,
  FRACTION_EQUIVALENCE_FEEDBACK_KEYS,
  FRACTION_EQUIVALENCE_REASON_CODE,
  FRACTION_NON_INTEGER_DIVISOR_CODE,
  FRACTION_ONE_SIDED_OPERATION_CODE,
  createFractionEquivalenceDiagnosticResult,
  createPublicFractionEquivalenceTask,
  fractionEquivalenceActivityFromStageId,
  parseDivisorPath,
  validateEquivalentChainEntry,
  validateEquivalentTransformation,
  validateSimplificationPath,
} from "@/lib/math/fractions/fractionEquivalenceLesson";

describe("WP-S3-03 — generator i walidatory skracania oraz rozszerzania", () => {
  it("generuje deterministyczne warianty support/core/challenge bez answerSpec", () => {
    for (const difficulty of ["support", "core", "challenge"] as const) {
      for (let seed = 0; seed < 500; seed += 1) {
        const first = createPublicFractionEquivalenceTask({ seed, difficulty, activity: "independent-equivalence" });
        const second = createPublicFractionEquivalenceTask({ seed, difficulty, activity: "independent-equivalence" });
        expect(second).toEqual(first);
        expect(first.result).toEqual({
          numerator: first.source.numerator * first.factor,
          denominator: first.source.denominator * first.factor,
        });
        expect(first.result.numerator * first.source.denominator)
          .toBe(first.source.numerator * first.result.denominator);
        expect(first).not.toHaveProperty("answerSpec");
      }
    }
  });

  it("utrwala sześć historii z własnymi przykładami i interpretacją mozaiki", () => {
    expect(createPublicFractionEquivalenceTask({ seed: 1, difficulty: "core", activity: "denser-partition" }))
      .toMatchObject({ source: { numerator: 3, denominator: 7 }, result: { numerator: 6, denominator: 14 }, factor: 2 });
    expect(createPublicFractionEquivalenceTask({ seed: 1, difficulty: "core", activity: "expansion-grid" }))
      .toMatchObject({ source: { numerator: 5, denominator: 8 }, result: { numerator: 15, denominator: 24 }, factor: 3 });
    expect(createPublicFractionEquivalenceTask({ seed: 1, difficulty: "core", activity: "collapse-partition" }))
      .toMatchObject({ source: { numerator: 16, denominator: 28 }, result: { numerator: 4, denominator: 7 }, factor: 4 });
    expect(createPublicFractionEquivalenceTask({ seed: 1, difficulty: "core", activity: "cross-out-rewrite" }))
      .toMatchObject({ source: { numerator: 54, denominator: 72 }, result: { numerator: 3, denominator: 4 }, factor: 18 });
    expect(createPublicFractionEquivalenceTask({ seed: 1, difficulty: "core", activity: "equivalent-chain" }).chain)
      .toEqual([{ numerator: 4, denominator: 9 }, { numerator: 8, denominator: 18 }, { numerator: 12, denominator: 27 }, { numerator: 16, denominator: 36 }]);
    expect(createPublicFractionEquivalenceTask({ seed: 1, difficulty: "core", activity: "paint-lab" }).chain)
      .toEqual([{ numerator: 4, denominator: 7 }, { numerator: 8, denominator: 14 }, { numerator: 12, denominator: 21 }]);
  });

  it("rozróżnia różne czynniki, działanie jednostronne i niecałkowity dzielnik", () => {
    const source = { numerator: 8, denominator: 12 };
    expect(validateEquivalentTransformation({ source, result: { numerator: 4, denominator: 6 }, mode: "simplify", numeratorFactor: 2, denominatorFactor: 3 }))
      .toBe(FRACTION_DIFFERENT_FACTORS_CODE);
    expect(validateEquivalentTransformation({ source, result: { numerator: 8, denominator: 6 }, mode: "simplify", numeratorFactor: 1, denominatorFactor: 2 }))
      .toBe(FRACTION_ONE_SIDED_OPERATION_CODE);
    expect(validateEquivalentTransformation({ source, result: { numerator: 4, denominator: 6 }, mode: "simplify", numeratorFactor: 2.5, denominatorFactor: 2.5 }))
      .toBe(FRACTION_NON_INTEGER_DIVISOR_CODE);
    expect(validateEquivalentTransformation({ source, result: { numerator: 2, denominator: 3 }, mode: "simplify", numeratorFactor: 4, denominatorFactor: 4 }))
      .toBeNull();
  });

  it("akceptuje różne poprawne ścieżki skracania, ale wymaga osobnej postaci nieskracalnej", () => {
    const source = { numerator: 24, denominator: 36 };
    const result = { numerator: 2, denominator: 3 };
    expect(validateSimplificationPath({ source, result, numeratorDivisors: [12], denominatorDivisors: [12] })).toBeNull();
    expect(validateSimplificationPath({ source, result, numeratorDivisors: [2, 2, 3], denominatorDivisors: [2, 2, 3] })).toBeNull();
    expect(validateSimplificationPath({ source, result: { numerator: 4, denominator: 6 }, numeratorDivisors: [6], denominatorDivisors: [6] }))
      .toBe("FRA_NOT_SIMPLIFIED");
    expect(validateSimplificationPath({ source, result, numeratorDivisors: [2, 2, 3], denominatorDivisors: [12] }))
      .toBe(FRACTION_DIFFERENT_FACTORS_CODE);
    expect(parseDivisorPath("2, 2; 3")).toEqual([2, 2, 3]);
  });

  it("L2 generuje wyłącznie skracanie redukowalnego ułamka do postaci nieskracalnej", () => {
    for (const difficulty of ["support", "core", "challenge"] as const) {
      const task = createPublicFractionEquivalenceTask({ seed: 533215, difficulty, activity: "independent-simplification" });
      expect(task.operation).toBe("simplify");
      expect(task.factor).toBeGreaterThan(1);
      expect(task.source.numerator / task.result.numerator).toBe(task.factor);
      expect(task.source.denominator / task.result.denominator).toBe(task.factor);
      expect(task).not.toHaveProperty("answerSpec");
    }
  });

  it("sprawdza dokładny krok 2/3 × 3 = 6/9 i mapuje siedem lokalnych aktywności", () => {
    expect(validateEquivalentChainEntry({ numerator: 2, denominator: 3 }, 3, { numerator: 6, denominator: 9 })).toBeNull();
    expect(validateEquivalentChainEntry({ numerator: 2, denominator: 3 }, 3, { numerator: 8, denominator: 12 })).toBe("FRA_WRONG_OPERATION_PAIR");
    expect([
      "equiv-denser-partition",
      "equiv-expansion-grid",
      "equiv-collapse-partition",
      "equiv-cross-out-rewrite",
      "equiv-equivalent-chain",
      "equiv-paint-lab",
      "equiv-independent",
      "l2-equiv-independent-simplification",
    ].map((suffix) => fractionEquivalenceActivityFromStageId(`m5-3-3-${suffix}`)))
      .toEqual(["denser-partition", "expansion-grid", "collapse-partition", "cross-out-rewrite", "equivalent-chain", "paint-lab", "independent-equivalence", "independent-simplification"]);
  });

  it("publikuje pełny feedback i trzyma prywatną rubrykę wyłącznie w module server-only", () => {
    expect(FRACTION_EQUIVALENCE_FEEDBACK_KEYS).toEqual(expect.arrayContaining([
      FRACTION_DIFFERENT_FACTORS_CODE,
      FRACTION_ONE_SIDED_OPERATION_CODE,
      FRACTION_NON_INTEGER_DIVISOR_CODE,
      FRACTION_EQUIVALENCE_REASON_CODE,
      "FRA_NOT_SIMPLIFIED",
    ]));
    expect(createFractionEquivalenceDiagnosticResult(FRACTION_DIFFERENT_FACTORS_CODE)).toMatchObject({
      result: { status: "incorrect", errorCodes: [FRACTION_DIFFERENT_FACTORS_CODE] },
      highlights: [{ kind: "pair", pattern: "double", state: "attention" }],
    });
    const publicModule = readFileSync(resolve(process.cwd(), "src/lib/math/fractions/fractionEquivalenceLesson.ts"), "utf8");
    const serverModule = readFileSync(resolve(process.cwd(), "src/lib/math/fractions/fractionEquivalenceLesson.server.ts"), "utf8");
    expect(publicModule).not.toContain("expectedExpanded:");
    expect(serverModule).toContain('import "server-only"');
    expect(serverModule).toContain("expectedExpanded");
    expect(serverModule).toContain("allowEquivalentIntermediatePaths");
  });
});
