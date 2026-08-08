import { describe, expect, it } from "vitest";
import { m426JednostkiMasyV1 } from "@/data/lessons/m4-2-6-jednostki-masy";

describe("M4-2.6 Jednostki masy", () => {
  it("publikuje kompletną lekcję z trzema celami i jednym kryterium do każdego", () => {
    expect(m426JednostkiMasyV1.status).toBe("published");
    expect(m426JednostkiMasyV1.learningGoals).toHaveLength(3);
    expect(m426JednostkiMasyV1.learningGoals.every((goal) => goal.successCriteria.length === 1)).toBe(true);
    expect(m426JednostkiMasyV1.stages[0]?.title).toBe("Cele lekcji (slajd 0)");
    expect(m426JednostkiMasyV1.stages.at(-1)?.kind).toBe("understanding");
  });

  it("utrzymuje serie pytań w jednym modelu i poprawny generator", () => {
    const modelStages = m426JednostkiMasyV1.stages.filter((stage) => stage.board.modelId === "grade4-mass-units-lab");
    expect(modelStages).toHaveLength(6);
    expect(modelStages.flatMap((stage) => stage.questions).every((question) => question.generatorId === "grade4-mass-units-l1-v1")).toBe(true);
    expect(modelStages.find((stage) => stage.id.endsWith("-choose-unit"))?.questions).toHaveLength(6);
    expect(modelStages.find((stage) => stage.id.endsWith("-convert"))?.questions).toHaveLength(8);
    expect(modelStages.find((stage) => stage.id.endsWith("-net-gross"))?.questions).toHaveLength(4);
  });
});
