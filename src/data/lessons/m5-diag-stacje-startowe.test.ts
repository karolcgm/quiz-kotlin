import { describe, expect, it } from "vitest";
import { m5DiagStacjeStartoweV1 } from "@/data/lessons/m5-diag-stacje-startowe";

describe("diagnoza startowa klasy V", () => {
  it("ma 10 zadaniowych stacji Live z pełnymi seriami", () => {
    const live = m5DiagStacjeStartoweV1.stages.filter((stage) => stage.live?.enabled);
    expect(live).toHaveLength(10);
    expect(live.reduce((sum, stage) => sum + (stage.live?.minutes ?? 0), 0)).toBe(35);
    expect(live.every((stage) => stage.board.modelId === "class4-review")).toBe(true);
    expect(live.map((stage) => stage.board.modelSeed)).toEqual([1,2,3,4,5,6,7,8,9,10]);
    expect(new Set(live.map((stage) => stage.title)).size).toBe(10);
    expect(live.every((stage) => stage.questions.every((question) => question.generatorId === "class4-review-v1"))).toBe(true);
    expect(live.map((stage) => stage.questions.length)).toEqual([5, 5, 5, 5, 5, 3, 3, 3, 4, 3]);
    expect(m5DiagStacjeStartoweV1.stages.reduce((sum, stage) => sum + stage.estimatedMinutes, 0)).toBe(35);
  });
});
