import { describe, expect, it } from "vitest";

import { getLessonPackageForTopic } from "@/data/lessons/registry";
import { m668PowtorzenieProcentowV1 } from "@/data/lessons/m6-6-8-powtorzenie";
import { decimalNotationL1ActivityFromStageId } from "@/lib/math/decimals/decimalNotationL1";

describe("M6-6.8 Powtórzenie wiadomości", () => {
  it("publikuje gotową lekcję zamiast szkieletu", () => {
    expect(getLessonPackageForTopic("M6-6.8")?.id).toBe(m668PowtorzenieProcentowV1.id);
    expect(m668PowtorzenieProcentowV1.status).toBe("published");
  });

  it("zawiera trzy nowe serie łączące umiejętności", () => {
    const activities = m668PowtorzenieProcentowV1.stages
      .filter((stage) => stage.questions.length > 0)
      .map((stage) => decimalNotationL1ActivityFromStageId(stage.id));

    expect(activities).toEqual([
      "percent-review-connections",
      "percent-review-diagrams",
      "percent-review-stories",
    ]);
  });

  it("każda seria ma pięć unikalnych zadań i wspólny generator", () => {
    const taskStages = m668PowtorzenieProcentowV1.stages.filter((stage) => stage.questions.length > 0);
    const questions = taskStages.flatMap((stage) => stage.questions);

    expect(taskStages).toHaveLength(3);
    expect(taskStages.every((stage) => stage.questions.length === 5)).toBe(true);
    expect(questions.every((question) => question.generatorId === "decimal-notation-l1-v1")).toBe(true);
    expect(new Set(questions.map((question) => question.id)).size).toBe(questions.length);
    expect(new Set(questions.map((question) => question.seed)).size).toBe(questions.length);
    expect(taskStages.some((stage) => stage.kind === "worked-example")).toBe(false);
  });
});
