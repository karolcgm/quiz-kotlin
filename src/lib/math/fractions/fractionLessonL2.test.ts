import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  FRACTION_L2_FEEDBACK_KEYS,
  FRACTION_MIXED_CONVERSION_CODE,
  classifyFraction,
  createFractionLessonL2DiagnosticResult,
  createPublicFractionLessonL2Task,
  fractionLessonL2ActivityFromStageId,
  mixedConversionEquation,
  toMixedFractionWithSameDenominator,
} from "@/lib/math/fractions/fractionLessonL2";

describe("WP-S3-01B — matematyka i generator L2", () => {
  it("generuje deterministycznie ułamki właściwe, niewłaściwe i mieszane bez mianownika zero", () => {
    const sourceKinds = new Set<string>();
    for (const difficulty of ["support", "core", "challenge"] as const) {
      for (let seed = 0; seed < 1000; seed += 1) {
        const first = createPublicFractionLessonL2Task({ seed, difficulty, activity: "independent-l2" });
        const second = createPublicFractionLessonL2Task({ seed, difficulty, activity: "independent-l2" });
        expect(second).toEqual(first);
        expect(first.target.denominator).toBeGreaterThan(0);
        expect(first.mixed.denominator).toBeGreaterThan(0);
        expect(first).not.toHaveProperty("answerSpec");
        sourceKinds.add(first.sourceKind);
      }
    }
    expect(sourceKinds).toEqual(new Set(["proper", "improper", "mixed"]));
  });

  it("obejmuje dokładne granice 1 i 2 oraz klasyfikuje je jako ułamki niewłaściwe", () => {
    const one = createPublicFractionLessonL2Task({ seed: 13, difficulty: "core", activity: "independent-l2" });
    const two = createPublicFractionLessonL2Task({ seed: 14, difficulty: "challenge", activity: "independent-l2" });
    expect(one.target.numerator).toBe(one.target.denominator);
    expect(two.target.numerator).toBe(2 * two.target.denominator);
    expect(classifyFraction(one.target)).toBe("improper");
    expect(classifyFraction(two.target)).toBe("improper");
    expect(classifyFraction({ numerator: 3, denominator: 4 })).toBe("proper");
  });

  it("zachowuje mianownik w zamianie i buduje łącznik całości × mianownik + licznik", () => {
    expect(toMixedFractionWithSameDenominator({ numerator: 7, denominator: 4 })).toEqual({ wholePart: 1, numerator: 3, denominator: 4 });
    expect(toMixedFractionWithSameDenominator({ numerator: 8, denominator: 4 })).toEqual({ wholePart: 2, numerator: 0, denominator: 4 });
    expect(mixedConversionEquation({ wholePart: 2, numerator: 3, denominator: 5 })).toEqual({ multiplication: 10, numerator: 3, result: 13, text: "2 × 5 + 3 = 13" });
  });

  it("utrwala przykłady 7/4 i 11/4 oraz mapę wszystkich etapów L2", () => {
    expect(createPublicFractionLessonL2Task({ seed: 1, difficulty: "core", activity: "more-than-one-pizza" }).target).toEqual({ numerator: 7, denominator: 4 });
    expect(createPublicFractionLessonL2Task({ seed: 1, difficulty: "core", activity: "class-picnic" }).target).toEqual({ numerator: 11, denominator: 4 });
    expect(fractionLessonL2ActivityFromStageId("m5-3-1-l2-more-than-one")).toBe("more-than-one-pizza");
    expect(fractionLessonL2ActivityFromStageId("m5-3-1-l2-group-wholes")).toBe("group-wholes");
    expect(fractionLessonL2ActivityFromStageId("m5-3-1-l2-convert")).toBe("convert-both-ways");
    expect(fractionLessonL2ActivityFromStageId("m5-3-1-l2-mixed-axis")).toBe("mixed-number-line");
    expect(fractionLessonL2ActivityFromStageId("m5-3-1-l2-class-picnic")).toBe("class-picnic");
    expect(fractionLessonL2ActivityFromStageId("m5-3-1-l2-independent")).toBe("independent-l2");
  });

  it("dodaje FRA_MIXED_CONVERSION do pełnego zestawu bazowej diagnostyki", () => {
    expect(FRACTION_L2_FEEDBACK_KEYS).toContain(FRACTION_MIXED_CONVERSION_CODE);
    expect(FRACTION_L2_FEEDBACK_KEYS).toEqual(expect.arrayContaining([
      "FRA_EMPTY_PART",
      "FRA_ZERO_DENOMINATOR",
      "FRA_NUM_DEN_SWAPPED",
      "FRA_NOT_EQUIVALENT",
      "FRA_NOT_SIMPLIFIED",
      "FRA_WRONG_OPERATION_PAIR",
    ]));
    expect(createFractionLessonL2DiagnosticResult(FRACTION_MIXED_CONVERSION_CODE)).toMatchObject({
      result: { status: "incorrect", errorCodes: ["FRA_MIXED_CONVERSION"] },
      highlights: [{ symbol: "× +", state: "attention" }],
    });
  });

  it("trzyma prywatny answerSpec za granicą server-only", () => {
    const serverModule = readFileSync(new URL("./fractionLessonL2.server.ts", import.meta.url), "utf8");
    expect(serverModule).toContain('import "server-only"');
    expect(serverModule).toContain("expectedMixed");
  });
});
