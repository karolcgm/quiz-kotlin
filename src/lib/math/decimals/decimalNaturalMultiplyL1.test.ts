import { describe, expect, it } from "vitest";
import {
  createPublicDecimalNaturalMultiplyL1Task,
  decimalNaturalMultiplyExpectedAnswer,
  validateDecimalNaturalMultiplyAnswer,
} from "@/lib/math/decimals/decimalNaturalMultiplyL1";

describe("M5-5.7 — mnożenie ułamka dziesiętnego przez liczbę naturalną", () => {
  it("udostępnia 10 prostych działań do mnożenia w pamięci", () => {
    const tasks = Array.from({ length: 10 }, (_, index) => createPublicDecimalNaturalMultiplyL1Task({
      seed: 557100 + index,
      difficulty: "core",
      activity: "decimal-natural-mental",
    }));
    expect(tasks.map(decimalNaturalMultiplyExpectedAnswer)).toEqual(["3,6", "10", "3,5", "6,8", "2,1", "1", "8,4", "8", "0,9", "6,15"]);
  });

  it("udostępnia 10 działań pisemnych wyłącznie przez liczbę naturalną", () => {
    const tasks = Array.from({ length: 10 }, (_, index) => createPublicDecimalNaturalMultiplyL1Task({
      seed: 557200 + index,
      difficulty: "core",
      activity: "decimal-natural-written",
    }));
    expect(tasks.every((task) => Number.isInteger(task.naturalFactor))).toBe(true);
    expect(tasks.map(decimalNaturalMultiplyExpectedAnswer)).toEqual(["7,05", "20,4", "7,62", "13,8", "14,63", "15,48", "7,56", "50", "42,24", "11,06"]);
  });

  it("akceptuje równoważny zapis wyniku i odrzuca błędny", () => {
    const task = createPublicDecimalNaturalMultiplyL1Task({ seed: 557200, difficulty: "core", activity: "decimal-natural-written" });
    expect(validateDecimalNaturalMultiplyAnswer({ task, answer: "7,050" }).correct).toBe(true);
    expect(validateDecimalNaturalMultiplyAnswer({ task, answer: "7,5" }).correct).toBe(false);
  });

  it("udostępnia sześć różnych zadań tekstowych z jednostkami i ilustracjami", () => {
    const tasks = Array.from({ length: 6 }, (_, index) => createPublicDecimalNaturalMultiplyL1Task({
      seed: 557300 + index,
      difficulty: "core",
      activity: "decimal-natural-story",
    }));

    expect(tasks.map((task) => task.answerUnit)).toEqual(["l", "m", "zł", "kg", "zł", "kg"]);
    expect(new Set(tasks.map((task) => task.pictureKind)).size).toBe(6);
    expect(tasks.every((task) => task.story && task.storyQuestion)).toBe(true);
  });
});
