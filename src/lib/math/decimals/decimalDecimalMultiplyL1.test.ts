import { describe, expect, it } from "vitest";
import {
  createPublicDecimalDecimalMultiplyL1Task,
  decimalDecimalMentalExpectedAnswer,
  decimalDecimalMultiplyExpectedAnswer,
  decimalDecimalWrittenTrace,
} from "@/lib/math/decimals/decimalDecimalMultiplyL1";

describe("M5-5.8 — mnożenie ułamków dziesiętnych", () => {
  it("udostępnia 10 różnych działań pamięciowych", () => {
    const tasks = Array.from({ length: 10 }, (_, index) => createPublicDecimalDecimalMultiplyL1Task({ seed: 558100 + index, difficulty: "core", activity: "decimal-decimal-mental" }));
    expect(tasks.map(decimalDecimalMultiplyExpectedAnswer)).toEqual(["0,06", "0,6", "0,6", "1", "0,15", "0,66", "0,2", "1,6", "0,036", "0,5"]);
  });

  it("w zadaniach pamięciowych zachowuje wszystkie miejsca dziesiętne, także zera", () => {
    expect(decimalDecimalMentalExpectedAnswer({ leftFactor: "0,4", rightFactor: "1,5" })).toBe("0,60");
    expect(decimalDecimalMentalExpectedAnswer({ leftFactor: "0,75", rightFactor: "0,2" })).toBe("0,150");
    expect(decimalDecimalMentalExpectedAnswer({ leftFactor: "2,5", rightFactor: "0,4" })).toBe("1,00");
    expect(decimalDecimalMentalExpectedAnswer({ leftFactor: "1,25", rightFactor: "0,4" })).toBe("0,500");
  });

  it("buduje pełny ślad pisemny z dwoma iloczynami częściowymi", () => {
    const task = createPublicDecimalDecimalMultiplyL1Task({ seed: 558200, difficulty: "core", activity: "decimal-decimal-written" });
    expect(decimalDecimalWrittenTrace(task)).toMatchObject({
      leftDigits: "12",
      rightDigits: "35",
      decimalPlaces: 3,
      partialProducts: [{ digit: "5", shift: 0, value: "60" }, { digit: "3", shift: 1, value: "36" }],
      rawProduct: "420",
      result: "0,42",
    });
  });

  it("udostępnia 10 działań pisemnych i 4 zadania tekstowe", () => {
    const written = Array.from({ length: 10 }, (_, index) => createPublicDecimalDecimalMultiplyL1Task({ seed: 558200 + index, difficulty: "core", activity: "decimal-decimal-written" }));
    const stories = Array.from({ length: 4 }, (_, index) => createPublicDecimalDecimalMultiplyL1Task({ seed: 558300 + index, difficulty: "core", activity: "decimal-decimal-story" }));
    expect(written.map(decimalDecimalMultiplyExpectedAnswer)).toEqual(["0,42", "3,29", "10,2", "1,344", "1,56", "3,048", "1,96", "7,55", "1,56", "8,1"]);
    expect(stories.map(decimalDecimalMultiplyExpectedAnswer)).toEqual(["3,6", "8,4", "20,8", "1"]);
    expect(new Set(stories.map((task) => task.pictureKind)).size).toBe(4);
    expect(stories.every((task) => task.story && task.storyQuestion && task.answerUnit)).toBe(true);
  });
});
