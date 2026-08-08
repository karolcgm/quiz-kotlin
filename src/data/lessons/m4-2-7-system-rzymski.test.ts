import { describe, expect, it } from "vitest";
import { m427SystemRzymskiV1 } from "@/data/lessons/m4-2-7-system-rzymski";

describe("M4-2.7 System rzymski", () => {
  it("is a complete published lesson with balanced goals", () => {
    expect(m427SystemRzymskiV1.status).toBe("published");
    expect(m427SystemRzymskiV1.learningGoals).toHaveLength(3);
    expect(m427SystemRzymskiV1.learningGoals.every((goal) => goal.successCriteria.length === 1)).toBe(true);
    expect(m427SystemRzymskiV1.stages[0]?.title).toBe("Cele lekcji (slajd 0)");
    expect(m427SystemRzymskiV1.stages.at(-1)?.kind).toBe("understanding");
  });

  it("keeps each exercise series in one model stage", () => {
    const stages = m427SystemRzymskiV1.stages.filter((stage) => stage.board.modelId === "grade4-roman-numerals-lab");
    expect(stages).toHaveLength(5);
    expect(stages.flatMap((stage) => stage.questions)).toHaveLength(24);
    expect(stages.flatMap((stage) => stage.questions).every((question) => question.generatorId === "grade4-roman-numerals-l1-v1")).toBe(true);
  });
});
