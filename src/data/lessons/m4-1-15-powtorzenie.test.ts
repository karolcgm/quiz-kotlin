import { describe, expect, it } from "vitest";
import { m4115PowtorzenieV1 } from "@/data/lessons/m4-1-15-powtorzenie";

describe("M4-1.15 Powtórzenie wiadomości", () => {
  it("łączy cały dział w pięciu interaktywnych seriach i jednej mapie", () => {
    const contentStages = m4115PowtorzenieV1.stages.filter((stage) => stage.board.modelId === "grade4-section-one-review-lab");
    expect(contentStages).toHaveLength(6);
    expect(contentStages.map((stage) => stage.questions.length)).toEqual([0, 5, 2, 2, 3, 3]);
    expect(contentStages.flatMap((stage) => stage.questions).every((question) => question.generatorId === "grade4-section-one-review-l1-v1")).toBe(true);
  });

  it("ma trzy cele i po jednym kryterium sukcesu", () => {
    expect(m4115PowtorzenieV1.learningGoals).toHaveLength(3);
    expect(m4115PowtorzenieV1.learningGoals.every((goal) => goal.successCriteria.length === 1)).toBe(true);
    expect(m4115PowtorzenieV1.status).toBe("published");
  });
});
