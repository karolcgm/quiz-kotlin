import { describe, expect, it } from "vitest";
import {
  alignedDecimalColumns,
  compareDecimalStrings,
  comparisonSign,
  createPublicDecimalComparisonTask,
  firstDifferentDecimalPlace,
  validateComparisonSign,
  validateDecimalOrder,
} from "@/lib/math/decimals/decimalComparisonL1";

describe("decimalComparisonL1", () => {
  it("akceptuje równoważne zera końcowe i nadal wymaga poprawnego znaku", () => {
    expect(compareDecimalStrings("0,5", "0,50")).toBe(0);
    expect(compareDecimalStrings("0,500", "0,5")).toBe(0);
    expect(comparisonSign("2,450", "2,45")).toBe("=");
    expect(validateComparisonSign("0,5", "0,500", "=")).toBe(true);
    expect(validateComparisonSign("0,5", "0,500", "<")).toBe(false);
  });

  it("porównuje dokładnie pułapki bez arytmetyki zmiennoprzecinkowej", () => {
    expect(comparisonSign("0,9", "0,899")).toBe(">");
    expect(comparisonSign("3,04", "3,4")).toBe("<");
    expect(comparisonSign("1,2", "1,205")).toBe("<");
  });

  it("wyrównuje kolumny i wskazuje pierwszą różną parę od lewej", () => {
    const equal = alignedDecimalColumns("0,5", "0,50", 2);
    expect(equal.leftDisplay).toBe("0,50");
    expect(equal.rightDisplay).toBe("0,50");
    expect(equal.columns.every((column) => column.equal)).toBe(true);
    expect(firstDifferentDecimalPlace("0,5", "0,50")).toBeNull();
    expect(firstDifferentDecimalPlace("2,376", "2,369")).toBe("hundredths");
    expect(firstDifferentDecimalPlace("1,205", "1,2")).toBe("thousandths");
  });

  it("waliduje pełną kolejność wartości, a nie długość zapisów", () => {
    const items = [
      { id: "a", value: "1,2" },
      { id: "b", value: "1,18" },
      { id: "c", value: "1,205" },
    ];
    expect(validateDecimalOrder(items, ["b", "a", "c"], "ascending")).toBe(true);
    expect(validateDecimalOrder(items, ["a", "b", "c"], "ascending")).toBe(false);
    expect(validateDecimalOrder(items, ["c", "a", "b"], "descending")).toBe(true);
    expect(validateDecimalOrder(items, ["c", "c", "b"], "descending")).toBe(false);
  });

  it("generuje deterministyczne warianty publiczne bez klucza odpowiedzi", () => {
    const first = createPublicDecimalComparisonTask({ seed: 552107, difficulty: "core", activity: "robot-ranking" });
    const second = createPublicDecimalComparisonTask({ seed: 552107, difficulty: "core", activity: "robot-ranking" });
    const challenge = createPublicDecimalComparisonTask({ seed: 552105, difficulty: "challenge", activity: "robot-ranking" });
    expect(first).toEqual(second);
    expect(first.generatorVersion).toBe(3);
    expect(first.robots.map((robot) => robot.id)).toEqual(["neon", "pixel", "turbo"]);
    expect(challenge.robots).toHaveLength(4);
    expect(first).not.toHaveProperty("answerSpec");
    expect(JSON.stringify(first)).not.toContain("answerSpec");
  });
});
