import { describe, expect, it } from "vitest";
import { createPercentOfNumberTask, isPercentOfNumberActivity } from "@/lib/math/decimals/percentOfNumber";

describe("M6-6.5 — obliczenia procentowe", () => {
  it("prowadzi przykład 30% z 40 przez wartość 10%", () => {
    const task = createPercentOfNumberTask({ seed: 0, activity: "percent-six-of-example" });

    expect(task).toMatchObject({
      whole: 40,
      percent: 30,
      basePercent: 10,
      divisor: 10,
      multiplier: 3,
      answer: 12,
    });
  });

  it("zawiera przykład procentu większego niż 100%", () => {
    const task = createPercentOfNumberTask({ seed: 4, activity: "percent-six-of-practice" });

    expect(task.percent).toBe(150);
    expect(task.whole).toBe(18);
    expect(task.answer).toBe(27);
  });

  it("buduje pionową tabelę z procentami obliczanymi w pamięci", () => {
    const task = createPercentOfNumberTask({ seed: 0, activity: "percent-six-of-table" });

    expect(task.tableRows).toEqual([
      { percent: 1, answer: 2 },
      { percent: 10, answer: 20 },
      { percent: 30, answer: 60 },
      { percent: 70, answer: 140 },
      { percent: 90, answer: 180 },
    ]);
  });

  it("rozpoznaje wyłącznie aktywności tego modelu", () => {
    expect(isPercentOfNumberActivity("percent-six-of-story")).toBe(true);
    expect(isPercentOfNumberActivity("percent-six-diagram")).toBe(false);
  });
});
