import { describe, expect, it } from "vitest";
import { m633SkalaNaPlanachIMapachV1 } from "@/data/lessons/m6-3-3-skala-na-planach-i-mapach";
import { getLessonPackageForTopic } from "@/data/lessons/registry";

describe("M6-3.3 Skala na planach i mapach", () => {
  it("publikuje pełną lekcję zamiast szkieletu", () => {
    expect(getLessonPackageForTopic("M6-3.3")?.id).toBe(m633SkalaNaPlanachIMapachV1.id);
    expect(m633SkalaNaPlanachIMapachV1.status).toBe("published");
  });

  it("ma wyjaśnienie i cztery serie zadań w jednym modelu", () => {
    const stages = m633SkalaNaPlanachIMapachV1.stages.filter((stage) => stage.student?.modelId === "map-scale-lab");
    expect(stages).toHaveLength(5);
    expect(stages[0].questions).toHaveLength(0);
    expect(stages.slice(1).every((stage) => stage.questions.length === 1)).toBe(true);
  });

  it("obejmuje odczytanie skali, jej wyznaczenie i oba kierunki obliczeń", () => {
    const criteria = m633SkalaNaPlanachIMapachV1.learningGoals[0]?.successCriteria ?? [];
    expect(criteria).toHaveLength(4);
    expect(criteria.join(" ")).toMatch(/1 cm/);
    expect(criteria.join(" ")).toMatch(/Wyznaczam skalę/);
    expect(criteria.join(" ")).toMatch(/na mapie i w terenie/);
  });
});
