import { describe, expect, it } from "vitest";
import {
  buildDecimalNaturalLongDivisionSteps,
  createPublicDecimalNaturalDivideL1Task,
} from "@/lib/math/decimals/decimalNaturalDivideL1";

describe("M5-5.9 — dzielenie dziesiętne przez naturalne", () => {
  it.each([
    ["decimal-natural-divide-mental", 559100, 10],
    ["decimal-natural-divide-written", 559200, 10],
    ["decimal-natural-divide-story", 559300, 4],
  ] as const)("ma poprawny wynik każdego działania w serii %s", (activity, firstSeed, count) => {
    for (let index = 0; index < count; index += 1) {
      const task = createPublicDecimalNaturalDivideL1Task({ seed: firstSeed + index, difficulty: "core", activity });
      const expected = Number(task.dividend.replace(",", ".")) / task.divisor;
      expect(Number(task.result.replace(",", ".")), `${task.dividend} : ${task.divisor}`).toBeCloseTo(expected, 10);
    }
  });

  it("tworzy 10 zadań pisemnych bez reszty, także z dopisywaniem zer", () => {
    const tasks = Array.from({ length: 10 }, (_, index) => createPublicDecimalNaturalDivideL1Task({ seed: 559200 + index, difficulty: "core", activity: "decimal-natural-divide-written" }));
    expect(tasks.map((task) => task.result)).toEqual(["0,525", "0,84", "1,875", "0,45", "1,05", "0,48", "1,2", "0,45", "0,45", "1,5625"]);
    expect(tasks.some((task) => task.appendedZeros > 0)).toBe(true);
  });

  it("zapisuje pełny przebieg 4,2 : 8, łącznie z początkowym 4 − 0", () => {
    const steps = buildDecimalNaturalLongDivisionSteps("4,2", 8, 2);
    expect(steps.map((step) => ({
      partial: step.partialDividendDisplay,
      product: step.productDisplay,
      next: step.nextDisplay,
      quotient: step.quotientDigit,
      end: step.end,
    }))).toEqual([
      { partial: "4", product: "0", next: "42", quotient: "0", end: 0 },
      { partial: "42", product: "40", next: "20", quotient: "5", end: 1 },
      { partial: "20", product: "16", next: "40", quotient: "2", end: 2 },
      { partial: "40", product: "40", next: "0", quotient: "5", end: 3 },
    ]);
  });

  it.each([
    ["decimal-natural-divide-written", 559200, 10],
    ["decimal-natural-divide-story", 559300, 4],
  ] as const)("wyprowadza poprawne kroki każdego działania w serii %s", (activity, firstSeed, count) => {
    for (let index = 0; index < count; index += 1) {
      const task = createPublicDecimalNaturalDivideL1Task({ seed: firstSeed + index, difficulty: "core", activity });
      const steps = buildDecimalNaturalLongDivisionSteps(task.dividend, task.divisor, task.appendedZeros);
      const quotientDigits = steps.map((step) => step.quotientDigit).join("");
      expect(quotientDigits, `${task.dividend} : ${task.divisor}`).toBe(task.result.replace(",", ""));
      expect(steps.at(-1)?.nextDisplay, `${task.dividend} : ${task.divisor}`).toBe("0");
      for (const step of steps) {
        expect(Number(step.partialDividendDisplay) - Number(step.productDisplay)).toBeLessThan(task.divisor);
        expect(Number(step.partialDividendDisplay) - Number(step.productDisplay)).toBeGreaterThanOrEqual(0);
      }
    }
  });
});
