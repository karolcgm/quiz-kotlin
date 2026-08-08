import { describe, expect, it } from "vitest";
import { m429GodzinyNaZegarachV1 } from "@/data/lessons/m4-2-9-godziny-na-zegarach";

describe("m4-2-9 Godziny na zegarach", () => {
  it("publikuje jedną lekcję z trzema seriami zadań", () => {
    expect(m429GodzinyNaZegarachV1.status).toBe("published");
    expect(m429GodzinyNaZegarachV1.topicId).toBe("M4-2.9");
    const stages = m429GodzinyNaZegarachV1.stages.filter((stage) => stage.board.modelId === "grade4-clock-time-lab");
    expect(stages).toHaveLength(5);
    expect(stages.flatMap((stage) => stage.questions)).toHaveLength(17);
    expect(stages.flatMap((stage) => stage.questions).every((question) => question.generatorId === "grade4-clock-time-l1-v1")).toBe(true);
  });

  it("ma trzy cele i dokładnie jedno kryterium do każdego celu", () => {
    expect(m429GodzinyNaZegarachV1.learningGoals).toHaveLength(3);
    expect(m429GodzinyNaZegarachV1.learningGoals.every((goal) => goal.successCriteria.length === 1)).toBe(true);
  });
});
