import { describe, expect, it } from "vitest";
import { m632JednostkiDlugosciIMasyV1 } from "@/data/lessons/m6-3-2-jednostki-dlugosci-i-masy";
import { getLessonPackageForTopic } from "@/data/lessons/registry";

describe("M6-3.2 Jednostki długości i jednostki masy", () => {
  it("publikuje pełną lekcję zamiast szkieletu", () => {
    expect(getLessonPackageForTopic("M6-3.2")?.id).toBe(m632JednostkiDlugosciIMasyV1.id);
    expect(m632JednostkiDlugosciIMasyV1.status).toBe("published");
  });

  it("zawiera przypomnienie oraz trzy serie zadań w spójnym modelu", () => {
    const stages = m632JednostkiDlugosciIMasyV1.stages.filter((stage) => stage.student?.modelId === "everyday-units-lab");
    expect(stages).toHaveLength(4);
    expect(stages[0].questions).toHaveLength(0);
    expect(stages.slice(1).every((stage) => stage.questions.length === 1)).toBe(true);
  });

  it("ma cele zgodne z tematem i uwzględnia miligramy", () => {
    const criteria = m632JednostkiDlugosciIMasyV1.learningGoals[0]?.successCriteria ?? [];
    expect(criteria).toHaveLength(3);
    expect(criteria.join(" ")).toMatch(/mg/i);
    expect(criteria.join(" ")).toMatch(/1 kg/i);
  });
});
