import { describe, expect, it } from "vitest";
import { m422PorownywanieLiczbNaturalnychV1 } from "@/data/lessons/m4-2-2-porownywanie-liczb-naturalnych";

describe("M4-2.2 Porównywanie liczb naturalnych", () => {
  it("publikuje pełną lekcję z trzema seriami zadań", () => {
    expect(m422PorownywanieLiczbNaturalnychV1.status).toBe("published");
    expect(m422PorownywanieLiczbNaturalnychV1.learningGoals).toHaveLength(3);
    expect(m422PorownywanieLiczbNaturalnychV1.learningGoals.every((goal) => goal.successCriteria.length === 1)).toBe(true);
    expect(m422PorownywanieLiczbNaturalnychV1.stages[0]?.title).toBe("Cele lekcji (slajd 0)");
    expect(m422PorownywanieLiczbNaturalnychV1.stages.at(-1)?.kind).toBe("understanding");
    const modelStages = m422PorownywanieLiczbNaturalnychV1.stages.filter((stage) => stage.board.modelId === "grade4-natural-number-comparison-lab");
    expect(modelStages).toHaveLength(4);
    expect(modelStages.flatMap((stage) => stage.questions)).toHaveLength(22);
    expect(modelStages.flatMap((stage) => stage.questions).every((question) => question.generatorId === "grade4-natural-number-comparison-l1-v1")).toBe(true);
  });
});
