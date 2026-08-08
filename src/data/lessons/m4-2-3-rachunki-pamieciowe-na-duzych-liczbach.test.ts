import { describe, expect, it } from "vitest";
import { m423RachunkiPamiecioweNaDuzychLiczbachV1 } from "@/data/lessons/m4-2-3-rachunki-pamieciowe-na-duzych-liczbach";

describe("M4-2.3 Rachunki pamięciowe na dużych liczbach", () => {
  it("publikuje trzy serie zawierające 20 zadań", () => {
    expect(m423RachunkiPamiecioweNaDuzychLiczbachV1.status).toBe("published");
    expect(m423RachunkiPamiecioweNaDuzychLiczbachV1.learningGoals).toHaveLength(3);
    expect(m423RachunkiPamiecioweNaDuzychLiczbachV1.learningGoals.every((goal) => goal.successCriteria.length === 1)).toBe(true);
    expect(m423RachunkiPamiecioweNaDuzychLiczbachV1.stages[0]?.title).toBe("Cele lekcji (slajd 0)");
    expect(m423RachunkiPamiecioweNaDuzychLiczbachV1.stages.at(-1)?.kind).toBe("understanding");
    const modelStages = m423RachunkiPamiecioweNaDuzychLiczbachV1.stages.filter((stage) => stage.board.modelId === "grade4-large-number-arithmetic-lab");
    expect(modelStages).toHaveLength(4);
    expect(modelStages.flatMap((stage) => stage.questions)).toHaveLength(20);
  });
});
