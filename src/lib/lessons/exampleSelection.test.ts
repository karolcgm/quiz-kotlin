import { describe, expect, it } from "vitest";
import { distinctIndex, distinctSequenceIndex } from "@/lib/lessons/exampleSelection";

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

  it("stabilizuje kolejno numerowane ziarna, aby pula nie powtarzała pozycji", () => {
    const indices = [1, 2, 3, 4].map((questionNumber) => distinctSequenceIndex(200 + questionNumber, questionNumber, 4));
    expect(indices).toEqual([0, 1, 2, 3]);
  });

  it.each([5, 6, 8, 10, 14])("przechodzi przez pulę %i elementów bez powtórki", (length) => {
    const indices = Array.from({ length }, (_, offset) => distinctIndex(3, offset + 1, length));
    expect(new Set(indices).size).toBe(length);
  });
});
