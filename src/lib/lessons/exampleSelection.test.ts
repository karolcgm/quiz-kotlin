import { describe, expect, it } from "vitest";
import { distinctIndex } from "@/lib/lessons/exampleSelection";

describe("distinctIndex", () => {
  it("nie powtarza pozycji puli w jednym cyklu zadań", () => {
    const indices = [1, 2, 3, 4, 5].map((questionNumber) => distinctIndex(2026, questionNumber, 5));
    expect(new Set(indices).size).toBe(5);
  });

  it("zmienia kolejność między sesjami bez utraty różnorodności", () => {
    const first = [1, 2, 3].map((questionNumber) => distinctIndex(11, questionNumber, 3));
    const second = [1, 2, 3].map((questionNumber) => distinctIndex(12, questionNumber, 3));
    expect(new Set(first).size).toBe(3);
    expect(new Set(second).size).toBe(3);
    expect(first).not.toEqual(second);
  });
});
