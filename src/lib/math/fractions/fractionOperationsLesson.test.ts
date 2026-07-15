import { describe, expect, it } from "vitest";
import {
  expectedFractionOperationsResult,
  fractionOperationsActivityFromStageId,
  fractionOperationsTasks,
} from "@/lib/math/fractions/fractionOperationsLesson";

describe("dział 3 — działania na ułamkach", () => {
  it.each(["3.7", "3.8", "3.9", "3.10", "3.11", "3.R", "3.S"] as const)("temat %s ma dokładnie pięć osobnych przykładów", (topic) => {
    const tasks = fractionOperationsTasks(topic);
    expect(tasks).toHaveLength(5);
    expect(tasks.every((task) => task.reasoning.length === 3)).toBe(true);
    expect(tasks.every((task) => task.expected.denominator > 0)).toBe(true);
  });

  it("upraszcza wzorcowe wyniki", () => {
    expect(expectedFractionOperationsResult(fractionOperationsTasks("3.7")[1]!)).toEqual({ numerator: 3, denominator: 2 });
    expect(expectedFractionOperationsResult(fractionOperationsTasks("3.9")[3]!)).toEqual({ numerator: 1, denominator: 4 });
    expect(expectedFractionOperationsResult(fractionOperationsTasks("3.11")[2]!)).toEqual({ numerator: 3, denominator: 4 });
  });

  it("rozpoznaje temat i fazę z identyfikatora slajdu", () => {
    expect(fractionOperationsActivityFromStageId("m5-3-7-independent-5")).toBe("operations-3.7-independent");
    expect(fractionOperationsActivityFromStageId("m5-3-10-reasoning")).toBe("operations-3.10-reasoning");
    expect(fractionOperationsActivityFromStageId("m5-3-r-context")).toBe("operations-3.R-context");
    expect(fractionOperationsActivityFromStageId("m5-3-6-independent")).toBeNull();
  });
});

