import { describe, expect, it } from "vitest";
import { m635KalkulatorV1 } from "@/data/lessons/m6-3-5-kalkulator";
import { getLessonPackageForTopic } from "@/data/lessons/registry";

describe("M6-3.5 Kalkulator", () => {
  it("publikuje pełną lekcję zamiast szkieletu", () => {
    expect(getLessonPackageForTopic("M6-3.5")?.id).toBe(m635KalkulatorV1.id);
    expect(m635KalkulatorV1.status).toBe("published");
  });

  it("ma instrukcję i trzy serie zadań obsługiwane jednym kalkulatorem", () => {
    const stages = m635KalkulatorV1.stages.filter((stage) => stage.student?.modelId === "calculator-lab");
    expect(stages).toHaveLength(4);
    expect(stages[0].questions).toHaveLength(0);
    expect(stages.slice(1).every((stage) => stage.questions.length === 1)).toBe(true);
  });

  it("obejmuje rozwinięcia dziesiętne, resztę z dzielenia i zadania praktyczne", () => {
    const titles = m635KalkulatorV1.stages.map((stage) => stage.title).join(" ");
    expect(titles).toMatch(/Rozwinięcia dziesiętne/u);
    expect(titles).toMatch(/Reszta z dzielenia/u);
    expect(titles).toMatch(/Zadania praktyczne/u);
  });
});
