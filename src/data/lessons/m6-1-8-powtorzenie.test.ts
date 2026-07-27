import { describe, expect, it } from "vitest";
import { m618PowtorzenieV1 } from "@/data/lessons/m6-1-8-powtorzenie";
import { getLessonPackageForTopic } from "@/data/lessons/registry";

describe("M6-1.8 Powtórzenie wiadomości", () => {
  it("publikuje właściwy pakiet zamiast szkicu", () => {
    expect(getLessonPackageForTopic("M6-1.8")?.id).toBe(m618PowtorzenieV1.id);
    expect(m618PowtorzenieV1.status).toBe("published");
  });

  it("obejmuje cały dział bez slajdów ponownie objaśniających teorię", () => {
    const contentStages = m618PowtorzenieV1.stages.filter(
      (stage) => !stage.id.endsWith("-trace-0") && !stage.id.endsWith("-understanding"),
    );
    expect(contentStages).toHaveLength(9);
    expect(contentStages.every((stage) => ["practice", "challenge", "exit-ticket"].includes(stage.kind))).toBe(true);
    expect(contentStages.every((stage) => stage.questions.length >= 3)).toBe(true);
    expect(new Set(contentStages.flatMap((stage) => stage.questions.map((question) => question.seed))).size)
      .toBe(contentStages.reduce((sum, stage) => sum + stage.questions.length, 0));
  });

  it("korzysta z dojrzałych interaktywnych modeli z wcześniejszych tematów", () => {
    const models = new Set(m618PowtorzenieV1.stages.map((stage) => stage.student?.modelId).filter(Boolean));
    expect(models.has("order-of-operations-lesson")).toBe(true);
    expect(models.has("decimal-mental-arithmetic-l6")).toBe(true);
    expect(models.has("decimal-notation-l1")).toBe(true);
    expect(models.has("fraction-lesson")).toBe(true);
  });

  it("każda seria ma jeden licznik oparty na pytaniach tego samego slajdu", () => {
    for (const stage of m618PowtorzenieV1.stages.filter((item) => item.questions.length > 0)) {
      expect(stage.live?.kind).toBe("exercise");
      expect(stage.student?.activityMode).toBe("respond");
      expect(new Set(stage.questions.map((question) => question.id)).size).toBe(stage.questions.length);
    }
  });
});
