import { describe, expect, it } from "vitest";
import { percentageToMark } from "@/lib/grading/mark";
import { calculatePercentage } from "@/lib/grading/score";

describe("calculatePercentage", () => {
  it("oblicza procent z zaokrągleniem", () => {
    expect(calculatePercentage(7, 10)).toBe(70);
    expect(calculatePercentage(1, 3)).toBe(33);
  });

  it("zwraca 0 przy maxScore <= 0", () => {
    expect(calculatePercentage(5, 0)).toBe(0);
  });
});

describe("percentageToMark", () => {
  it("mapuje progi na ocenę 1–6", () => {
    expect(percentageToMark(100)).toBe(6);
    expect(percentageToMark(96)).toBe(6);
    expect(percentageToMark(86)).toBe(5);
    expect(percentageToMark(70)).toBe(4);
    expect(percentageToMark(50)).toBe(3);
    expect(percentageToMark(30)).toBe(2);
    expect(percentageToMark(0)).toBe(1);
  });
});
