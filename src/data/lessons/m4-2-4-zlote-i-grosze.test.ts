import { describe, expect, it } from "vitest";
import { m424ZloteIGroszeV1 } from "@/data/lessons/m4-2-4-zlote-i-grosze";

describe("M4-2.4 Złote i grosze", () => {
  it("publikuje informację, przykład i trzy serie zawierające 16 zadań", () => {
    expect(m424ZloteIGroszeV1.status).toBe("published");
    expect(m424ZloteIGroszeV1.learningGoals).toHaveLength(3);
    expect(m424ZloteIGroszeV1.learningGoals.every((goal) => goal.successCriteria.length === 1)).toBe(true);
    expect(m424ZloteIGroszeV1.stages[0]?.title).toBe("Cele lekcji (slajd 0)");
    expect(m424ZloteIGroszeV1.stages.at(-1)?.kind).toBe("understanding");
    const modelStages = m424ZloteIGroszeV1.stages.filter((stage) => stage.board.modelId === "grade4-money-lab");
    expect(modelStages).toHaveLength(5);
    expect(modelStages.flatMap((stage) => stage.questions)).toHaveLength(16);
    expect(modelStages.flatMap((stage) => stage.questions).every((question) => question.generatorId === "grade4-money-l1-v1")).toBe(true);
  });
});
