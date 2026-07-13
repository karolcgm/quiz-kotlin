import { describe, expect, it } from "vitest";
import { m514KolejnoscDzialanV1 } from "@/data/lessons/m5-1-4-kolejnosc-dzialan";

describe("lekcja M5-1.4", () => {
  it("ma cztery slajdy i serie 1, 3, 5", () => {
    expect(m514KolejnoscDzialanV1.stages).toHaveLength(4);
    expect(m514KolejnoscDzialanV1.stages.map((stage) => stage.questions.length)).toEqual([0, 1, 3, 5]);
    expect(m514KolejnoscDzialanV1.stages.reduce((sum, stage) => sum + stage.estimatedMinutes, 0)).toBe(45);
    expect(m514KolejnoscDzialanV1.stages.slice(1).every((stage) => stage.student?.modelId === "order-of-operations-lesson")).toBe(true);
  });
});
