import { describe, expect, it } from "vitest";
import { m512SkokiPoOsiV1 } from "@/data/lessons/m5-1-2-skoki-po-osi";

describe("lekcja M5-1.2", () => {
  it("ma podręcznik, jedno zadanie językowe i dziesięć obliczeń", () => {
    expect(m512SkokiPoOsiV1.stages).toHaveLength(3);
    expect(m512SkokiPoOsiV1.stages.map((stage) => stage.questions.length)).toEqual([0, 1, 10]);
    expect(m512SkokiPoOsiV1.stages[0]?.board.modelId).toBe("exercise-board");
    expect(m512SkokiPoOsiV1.stages.slice(1).every((stage) => stage.student?.modelId === "mental-add-sub-lesson")).toBe(true);
    expect(m512SkokiPoOsiV1.stages.reduce((sum, stage) => sum + stage.estimatedMinutes, 0)).toBe(45);
  });
});
