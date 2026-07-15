import { describe, expect, it } from "vitest";
import { section3LessonsWpC3 } from "@/data/lessons/section3-wp-c3";

describe("dział 3 — kontrakt stylu działów 1–2", () => {
  it("realizuje komplet 24 pakietów L1/L2/L3 z planu", () => {
    expect(section3LessonsWpC3).toHaveLength(24);
    expect(section3LessonsWpC3.filter((lesson) => lesson.topicId === "M5-3.3")).toHaveLength(2);
    expect(section3LessonsWpC3.filter((lesson) => lesson.topicId === "M5-3.4")).toHaveLength(2);
    expect(section3LessonsWpC3.filter((lesson) => lesson.topicId === "M5-3.11")).toHaveLength(3);
  });

  it.each(section3LessonsWpC3.map((lesson) => [lesson.id, lesson] as const))("%s ma wspólny slajd 0 i identyczny slajd końcowy", (_, lesson) => {
    expect(lesson.stages[0]).toMatchObject({
      title: "Cele lekcji (slajd 0)",
      board: { modelId: "exercise-board" },
      live: { kind: "presentation" },
    });
    expect(lesson.stages.at(-1)).toMatchObject({
      kind: "understanding",
      title: "Ocena umiejętności",
      live: { kind: "quick-check" },
      board: { headline: "Ocena ucznia — co już potrafię?" },
      understanding: {
        heading: "Ocena ucznia — co już potrafię?",
        selfAssessmentAffectsScore: false,
      },
    });
  });

  it.each(section3LessonsWpC3.map((lesson) => [lesson.id, lesson] as const))("%s ma jeden dowodowy slajd z pięcioma osobnymi przykładami", (_, lesson) => {
    const evidenceStages = lesson.stages.filter((stage) => stage.questions.length === 5);
    expect(evidenceStages).toHaveLength(1);
    expect(evidenceStages[0]).toMatchObject({ title: "Ćwiczenia — 5 przykładów", board: { modelId: "fraction-lesson" }, student: { modelId: "fraction-lesson" } });
    expect(evidenceStages[0]!.questions.map((question) => question.id)).toHaveLength(5);
    expect(new Set(evidenceStages[0]!.questions.map((question) => question.id)).size).toBe(5);
    expect(evidenceStages[0]!.questions.every((question) => !question.id.includes("-extra-"))).toBe(true);
    expect(evidenceStages[0]!.print?.items).toHaveLength(5);
  });

  it.each(["M5-3.7", "M5-3.8", "M5-3.9", "M5-3.10", "M5-3.11", "M5-3.R", "M5-3.S"])("%s nie ma już pustych slajdów fabrycznych", (topicId) => {
    const lesson = section3LessonsWpC3.find((item) => item.topicId === topicId)!;
    const content = lesson.stages.slice(1, -1);
    expect(content).toHaveLength(4);
    expect(content.every((stage) => stage.board.modelId === "fraction-lesson" && stage.student?.modelId === "fraction-lesson")).toBe(true);
  });
});
