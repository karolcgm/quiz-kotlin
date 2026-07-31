import { describe, expect, it } from "vitest";
import { m661ProcentyAUlamkiV1 } from "@/data/lessons/m6-6-1-procenty-a-ulamki";
import { getLessonPackageForTopic } from "@/data/lessons/registry";

describe("M6-6.1 Procenty a ułamki", () => {
  it("zastępuje szkielet klasy 6 opublikowanym pakietem", () => {
    expect(getLessonPackageForTopic("M6-6.1")).toBe(m661ProcentyAUlamkiV1);
    expect(m661ProcentyAUlamkiV1.status).toBe("published");
  });

  it("ma teorię 1%, serię zamian i podstawowe zadania z procentami", () => {
    const stages = m661ProcentyAUlamkiV1.stages;

    expect(stages.some((stage) => stage.id.includes("percent-six-remember"))).toBe(true);
    expect(stages.find((stage) => stage.id.includes("percent-six-convert"))?.questions).toHaveLength(10);
    expect(stages.find((stage) => stage.id.includes("percent-six-grid"))?.questions).toHaveLength(5);
    expect(stages.find((stage) => stage.id.includes("percent-six-story"))?.questions).toHaveLength(10);
  });
});
