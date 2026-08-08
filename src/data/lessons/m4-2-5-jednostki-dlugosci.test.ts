import { describe, expect, it } from "vitest";
import { m425JednostkiDlugosciV1 } from "@/data/lessons/m4-2-5-jednostki-dlugosci";

describe("M4-2.5 Jednostki długości", () => {
  it("publikuje dwa slajdy informacyjne i trzy serie zawierające 15 zadań", () => {
    expect(m425JednostkiDlugosciV1.status).toBe("published");
    expect(m425JednostkiDlugosciV1.learningGoals).toHaveLength(3);
    expect(m425JednostkiDlugosciV1.learningGoals.every((goal) => goal.successCriteria.length === 1)).toBe(true);
    expect(m425JednostkiDlugosciV1.stages[0]?.title).toBe("Cele lekcji (slajd 0)");
    expect(m425JednostkiDlugosciV1.stages.at(-1)?.kind).toBe("understanding");
    const modelStages = m425JednostkiDlugosciV1.stages.filter((stage) => stage.board.modelId === "grade4-length-units-lab");
    expect(modelStages).toHaveLength(5);
    expect(modelStages.flatMap((stage) => stage.questions)).toHaveLength(15);
    expect(modelStages.flatMap((stage) => stage.questions).every((question) => question.generatorId === "grade4-length-units-l1-v1")).toBe(true);
  });
});
