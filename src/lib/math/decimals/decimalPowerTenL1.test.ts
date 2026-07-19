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

  it("udostępnia przykład przesunięcia i nie wysyła klucza", () => {
    const task = createPublicDecimalPowerTenTask({ seed: 555500, difficulty: "core", activity: "power10-position-shift" });
    expect(decimalDigitMovements(task).map(({ digit, sourcePower, targetPower }) => ({ digit, sourcePower, targetPower }))).toEqual([
      { digit: "3", sourcePower: 0, targetPower: 1 },
      { digit: "4", sourcePower: -1, targetPower: 0 },
      { digit: "5", sourcePower: -2, targetPower: -1 },
    ]);
    expect(JSON.stringify(task)).not.toContain("answerSpec");
  });

  it("tworzy 10 działań do samodzielnego uzupełnienia", () => {
    const tasks = Array.from({ length: 10 }, (_, index) => createPublicDecimalPowerTenTask({
      seed: 555500 + index,
      difficulty: "core",
      activity: "power10-practice",
    }));
    expect(tasks.map(decimalPowerTenExpectedAnswer)).toEqual(["34,5", "80", "250", "34", "1200", "40,7", "900", "1205", "0,6", "7008"]);
    expect(tasks.every((task) => task.questionKind === "result")).toBe(true);
  });

  it("diagnozuje brak potrzebnego zera", () => {
    const missingZero = createPublicDecimalPowerTenTask({ seed: 555501, difficulty: "core", activity: "power10-practice" });
    expect(validateDecimalPowerTenAnswer({ task: missingZero, answer: "8" }).code).toBe("DEC_MISSING_ZERO");
  });
});
