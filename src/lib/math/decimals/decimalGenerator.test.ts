import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { buildGeneratedDecimalQuestion, toDecimalPublicQuestion } from "@/lib/math/decimals/decimalGeneratorCore";
import { validateDecimalAnswer } from "@/lib/math/decimals/decimalValidation";
import { compareDecimalValues, parseDecimalInput } from "@/lib/math/decimals";
import type { DecimalGeneratorConfig, DecimalGeneratorTask } from "@/types/decimals";

function config(task: DecimalGeneratorTask): DecimalGeneratorConfig {
  return {
    task,
    decimalPlacesMin: 1,
    decimalPlacesMax: 4,
    integerDigitsMax: 3,
    maximumValue: 999,
    units: task === "unit" ? ["mm", "cm", "m"] : undefined,
    skillIds: ["M5-5.foundation"],
  };
}

describe("deterministyczny generator dziesiętny", () => {
  it.each(["place-value", "add", "subtract", "multiply", "divide", "unit"] as const)("powtarza seed dla zadania %s", (task) => {
    const first = buildGeneratedDecimalQuestion({ seed: 20260715, difficulty: "core", config: config(task) });
    const second = buildGeneratedDecimalQuestion({ seed: 20260715, difficulty: "core", config: config(task) });
    expect(second).toEqual(first);
  });

  it.each(["place-value", "add", "subtract", "multiply", "divide", "unit"] as const)("sprawdza 20 seedów, miejsca i zakres: %s", (task) => {
    for (let seed = 0; seed < 20; seed += 1) {
      const generated = buildGeneratedDecimalQuestion({ seed, difficulty: "core", config: config(task) });
      expect(generated.publicQuestion.params.decimalPlaces.every((places) => places >= 1 && places <= 4)).toBe(true);
      expect(generated.publicQuestion.params.maximumValue).toBe(999);
      expect(generated.answerSpec.expected.coefficient).toMatch(/^\d+$/u);
      const maximum = parseDecimalInput("999");
      expect(maximum.ok && compareDecimalValues(generated.answerSpec.expected, maximum.value) <= 0).toBe(true);
      if (task === "multiply") {
        expect(generated.answerSpec.strategy.productPlaces).toBe(generated.publicQuestion.params.decimalPlaces.reduce((sum, places) => sum + places, 0));
      }
    }
  });

  it("nie serializuje answerSpec ani oczekiwanej strategii do klienta", () => {
    const generated = buildGeneratedDecimalQuestion({ seed: 8, difficulty: "support", config: config("multiply") });
    const publicQuestion = toDecimalPublicQuestion(generated);
    expect(publicQuestion).not.toHaveProperty("answerSpec");
    expect(JSON.stringify(publicQuestion)).not.toContain("partialProducts");
    expect(JSON.stringify(publicQuestion)).not.toContain(generated.answerSpec.expectedDisplay);
  });

  it("utrzymuje answerSpec i walidację za jawną granicą server-only", () => {
    expect(readFileSync(new URL("./decimalGenerator.server.ts", import.meta.url), "utf8")).toContain('import "server-only"');
    expect(readFileSync(new URL("./decimalValidation.server.ts", import.meta.url), "utf8")).toContain('import "server-only"');
  });
});

describe("serwerowa walidacja wartości, strategii i jednostek", () => {
  it("akceptuje równoważne zera, ale zachowuje ślad", () => {
    const spec = buildGeneratedDecimalQuestion({ seed: 10, difficulty: "core", config: config("place-value") }).answerSpec;
    const withZero = `${spec.expectedDisplay}0`;
    expect(validateDecimalAnswer({ value: withZero, strategy: spec.strategy }, spec)).toMatchObject({ status: "correct", errorCodes: [] });
    expect(validateDecimalAnswer({ value: withZero, strategy: spec.strategy }, spec).normalizedAnswer).toMatchObject({ trace: { trailingZeroCount: expect.any(Number) } });
  });

  it("diagnozuje pustkę, brak zera, złą strategię mnożenia i skalowanie tylko jednej liczby", () => {
    const multiply = buildGeneratedDecimalQuestion({ seed: 4, difficulty: "core", config: config("multiply") });
    expect(validateDecimalAnswer({ value: "" }, multiply.answerSpec)).toMatchObject({ errorCodes: ["DEC_EMPTY"] });
    expect(validateDecimalAnswer({ value: multiply.answerSpec.expectedDisplay, strategy: { productPlaces: 0, partialProductShifts: multiply.answerSpec.strategy.partialProductShifts } }, multiply.answerSpec)).toMatchObject({ status: "partially-correct", errorCodes: ["DEC_PRODUCT_PLACES"] });
    const divide = buildGeneratedDecimalQuestion({ seed: 7, difficulty: "core", config: config("divide") });
    expect(validateDecimalAnswer({ value: divide.answerSpec.expectedDisplay, strategy: { divisionScalePower: divide.answerSpec.strategy.divisionScalePower, scaledDividend: divide.answerSpec.strategy.scaledDividend, scaledDivisor: "1" } }, divide.answerSpec)).toMatchObject({ errorCodes: ["DEC_DIVISOR_SCALE"] });
    const missingZeroSpec = { ...divide.answerSpec, expected: { sign: 1 as const, coefficient: "5", scale: 1 }, expectedDisplay: "0,5", strategy: {} };
    expect(validateDecimalAnswer({ value: ",5" }, missingZeroSpec)).toMatchObject({ errorCodes: ["DEC_MISSING_ZERO"] });
  });

  it("oddziela punkt za poprawną liczbę od błędnej jednostki", () => {
    const unit = buildGeneratedDecimalQuestion({ seed: 3, difficulty: "core", config: config("unit") });
    expect(validateDecimalAnswer({ value: unit.answerSpec.expectedDisplay, unit: "kg" }, unit.answerSpec)).toMatchObject({ status: "partially-correct", errorCodes: ["DEC_UNIT_MISMATCH"] });
    expect(validateDecimalAnswer({ value: unit.answerSpec.expectedDisplay, unit: unit.answerSpec.expectedUnit }, unit.answerSpec)).toMatchObject({ status: "correct" });
  });
});
