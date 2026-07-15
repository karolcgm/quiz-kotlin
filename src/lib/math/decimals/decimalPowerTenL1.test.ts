import { describe, expect, it } from "vitest";
import {
  createPublicDecimalPowerTenTask,
  decimalDigitMovements,
  decimalPowerTenExpectedAnswer,
  decimalPowerTenResult,
  validateDecimalPowerTenAnswer,
} from "@/lib/math/decimals/decimalPowerTenL1";

describe("M5-5.5 — mnożenie przez 10, 100 i 1000", () => {
  it.each([
    ["3,45", 1, "34,5"],
    ["3,45", 2, "345"],
    ["0,08", 3, "80"],
    ["0,012", 2, "1,2"],
  ] as const)("oblicza %s × 10^%s bez arytmetyki zmiennoprzecinkowej", (operand, exponent, expected) => {
    expect(decimalPowerTenResult(operand, exponent)).toBe(expected);
  });

  it("opisuje ruch cyfr, a nie ruch przecinka", () => {
    const task = createPublicDecimalPowerTenTask({ seed: 555500, difficulty: "core", activity: "power10-position-shift" });
    expect(decimalDigitMovements(task).map(({ digit, sourcePower, targetPower }) => ({ digit, sourcePower, targetPower }))).toEqual([
      { digit: "3", sourcePower: 0, targetPower: 1 },
      { digit: "4", sourcePower: -1, targetPower: 0 },
      { digit: "5", sourcePower: -2, targetPower: -1 },
    ]);
    expect(task.invariants).toContain("digits-change-place-value-comma-stays-fixed");
    expect(JSON.stringify(task)).not.toContain("answerSpec");
  });

  it("tworzy pięć różnych dowodów uczenia", () => {
    const tasks = Array.from({ length: 5 }, (_, index) => createPublicDecimalPowerTenTask({
      seed: 555500 + index,
      difficulty: "core",
      activity: "power10-practice",
    }));
    expect(tasks.map(decimalPowerTenExpectedAnswer)).toEqual(["34,5", "80", "250", "100", "1200"]);
    expect(tasks.map((task) => task.questionKind)).toEqual(["result", "result", "result", "missing-factor", "unit-conversion"]);
  });

  it("diagnozuje brak zera i jednostkę niezależnie od poprawnej liczby", () => {
    const missingZero = createPublicDecimalPowerTenTask({ seed: 555501, difficulty: "core", activity: "power10-practice" });
    expect(validateDecimalPowerTenAnswer({ task: missingZero, answer: "8" }).code).toBe("DEC_MISSING_ZERO");

    const unit = createPublicDecimalPowerTenTask({ seed: 555504, difficulty: "core", activity: "power10-practice" });
    expect(validateDecimalPowerTenAnswer({ task: unit, answer: "1200", unit: "m" })).toMatchObject({
      correct: false,
      code: "DEC_UNIT_MISMATCH",
    });
    expect(validateDecimalPowerTenAnswer({ task: unit, answer: "1200", unit: "mm" }).correct).toBe(true);
  });
});
