import { describe, expect, it } from "vitest";

import { getLessonPackageForTopic } from "@/data/lessons/registry";
import { m668PowtorzenieProcentowV1 } from "@/data/lessons/m6-6-8-powtorzenie";
import { decimalNotationL1ActivityFromStageId } from "@/lib/math/decimals/decimalNotationL1";

describe("M6-6.8 Powtórzenie wiadomości", () => {
  it("publikuje gotową lekcję zamiast szkieletu", () => {
    expect(getLessonPackageForTopic("M6-6.8")?.id).toBe(m668PowtorzenieProcentowV1.id);
    expect(m668PowtorzenieProcentowV1.status).toBe("published");
  });

  it("obejmuje wszystkie najważniejsze obszary działu procenty", () => {
    const stageIds = m668PowtorzenieProcentowV1.stages.map((stage) => stage.id).join(" ");

    expect(stageIds).toContain("percent-six-convert-review");
    expect(stageIds).toContain("percent-six-what-fraction-practice-review");
    expect(stageIds).toContain("percent-diagrams-pie-review");
    expect(stageIds).toContain("percent-diagrams-bars-review");
    expect(stageIds).toContain("percent-six-of-practice-review");
    expect(stageIds).toContain("whole-from-percent-practice-review");
    expect(stageIds).toContain("percent-change-products-review");
    expect(stageIds).toContain("percent-change-salaries-review");
  });

  it("otwiera właściwy model interaktywny dla każdej serii", () => {
    const activities = m668PowtorzenieProcentowV1.stages
      .filter((stage) => stage.questions.length > 0)
      .map((stage) => decimalNotationL1ActivityFromStageId(stage.id));

    expect(activities).toEqual([
      "percent-six-convert",
      "percent-six-what-fraction-practice",
      "percent-diagrams-pie",
      "percent-diagrams-bars",
      "percent-six-of-practice",
      "whole-from-percent-practice",
      "percent-change-products",
      "percent-change-salaries",
    ]);
  });

  it("ma unikalne pytania, jeden generator zadań i bez slajdów ponownie tłumaczących teorię", () => {
    const taskStages = m668PowtorzenieProcentowV1.stages.filter((stage) => stage.questions.length > 0);
    const questionIds = taskStages.flatMap((stage) => stage.questions.map((question) => question.id));
    const seeds = taskStages.flatMap((stage) => stage.questions.map((question) => question.seed));

    expect(taskStages).toHaveLength(8);
    expect(taskStages.every((stage) => stage.questions.every((question) => question.generatorId === "decimal-notation-l1-v1"))).toBe(true);
    expect(taskStages.every((stage) => stage.questions.length >= 4)).toBe(true);
    expect(taskStages.some((stage) => stage.kind === "worked-example")).toBe(false);
    expect(new Set(questionIds).size).toBe(questionIds.length);
    expect(new Set(seeds).size).toBe(seeds.length);
  });
});
