import { describe, expect, it } from "vitest";
import { m634ZaokraglanieLiczbV1 } from "@/data/lessons/m6-3-4-zaokraglanie-liczb";
import { getLessonPackageForTopic } from "@/data/lessons/registry";

describe("M6-3.4 Zaokrąglanie liczb", () => {
  it("publikuje pełną lekcję zamiast szkieletu", () => {
    expect(getLessonPackageForTopic("M6-3.4")?.id).toBe(m634ZaokraglanieLiczbV1.id);
    expect(m634ZaokraglanieLiczbV1.status).toBe("published");
  });

  it("ma nazwy miejsc, przykład i jedną serię zadań", () => {
    const stages = m634ZaokraglanieLiczbV1.stages.filter((stage) => stage.student?.modelId === "rounding-lab");
    expect(stages).toHaveLength(3);
    expect(stages[0].questions).toHaveLength(0);
    expect(stages[1].questions).toHaveLength(0);
    expect(stages[2].questions).toHaveLength(1);
  });

  it("wymaga wskazania cyfry zaokrąglanej i cyfry po prawej stronie", () => {
    const criteria = m634ZaokraglanieLiczbV1.learningGoals[0]?.successCriteria ?? [];
    expect(criteria.join(" ")).toMatch(/miejsca cyfr/u);
    expect(criteria.join(" ")).toMatch(/po jej prawej stronie/u);
    expect(criteria.join(" ")).toMatch(/0–4/u);
  });
});
