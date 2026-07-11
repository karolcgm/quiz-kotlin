import { describe, expect, it } from "vitest";
import { m513ProstokatMnozeniaV1 } from "@/data/lessons/m5-1-3-prostokat-mnozenia";

describe("lekcja M5-1.3", () => {
  it("ma osiem slajdów i właściwe serie odpowiedzi", () => {
    expect(m513ProstokatMnozeniaV1.stages).toHaveLength(8);
    expect(m513ProstokatMnozeniaV1.stages.map((stage) => stage.questions.length)).toEqual([0, 1, 5, 3, 2, 2, 2, 2]);
    expect(m513ProstokatMnozeniaV1.stages.reduce((sum, stage) => sum + stage.estimatedMinutes, 0)).toBe(45);
    expect(m513ProstokatMnozeniaV1.stages.slice(1).every((stage) => stage.student?.modelId === "mental-mul-div-lesson")).toBe(true);
  });
});
