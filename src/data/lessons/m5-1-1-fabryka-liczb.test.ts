import { describe, expect, it } from "vitest";
import { m511FabrykaLiczbV1 } from "@/data/lessons/m5-1-1-fabryka-liczb";

describe("lekcja M5-1.1", () => {
  it("ma slajd podręcznika i sześć serii po trzy zadania", () => {
    expect(m511FabrykaLiczbV1.stages).toHaveLength(7);
    expect(m511FabrykaLiczbV1.stages.map((stage) => stage.questions.length)).toEqual([0, 3, 3, 3, 3, 3, 3]);
    expect(m511FabrykaLiczbV1.stages[0]?.board.modelId).toBe("exercise-board");
    expect(m511FabrykaLiczbV1.stages.slice(1).every((stage) => stage.student?.modelId === "natural-numbers-lesson")).toBe(true);
    expect(m511FabrykaLiczbV1.stages.reduce((sum, stage) => sum + stage.estimatedMinutes, 0)).toBe(45);
  });
});
