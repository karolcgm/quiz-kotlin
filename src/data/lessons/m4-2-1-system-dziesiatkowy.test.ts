import { describe, expect, it } from "vitest";
import { m421SystemDziesiatkowyV1 } from "@/data/lessons/m4-2-1-system-dziesiatkowy";

describe("M4-2.1 System dziesiątkowy", () => {
  it("publikuje pełną lekcję z trzema celami i interaktywnymi seriami", () => {
    expect(m421SystemDziesiatkowyV1.status).toBe("published");
    expect(m421SystemDziesiatkowyV1.learningGoals).toHaveLength(3);
    expect(m421SystemDziesiatkowyV1.learningGoals.every((goal) => goal.successCriteria.length === 1)).toBe(true);
    expect(m421SystemDziesiatkowyV1.stages[0]?.title).toBe("Cele lekcji (slajd 0)");
    expect(m421SystemDziesiatkowyV1.stages.at(-1)?.kind).toBe("understanding");

    const modelStages = m421SystemDziesiatkowyV1.stages.filter((stage) => stage.board.modelId === "grade4-decimal-system-lab");
    expect(modelStages).toHaveLength(5);
    expect(modelStages.flatMap((stage) => stage.questions)).toHaveLength(17);
    expect(modelStages.flatMap((stage) => stage.questions).every((question) => question.generatorId === "grade4-decimal-system-l1-v1")).toBe(true);
  });
});
