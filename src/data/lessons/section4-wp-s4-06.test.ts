import { describe, expect, it } from "vitest";
import { m546DwieKlasyfikacjeL2V1, m546TrojkatnyPlacZabawV1, section4LessonsWpC4 } from "@/data/lessons/section4-wp-c4";
import { lessonChannelContractIssues } from "@/lib/lessons/lessonRuntime";
import { isTriangleTypesLessonSeed } from "@/lib/math/geometry/triangleTypes";

describe("WP-S4-06 — Rodzaje trójkątów L1/L2", () => {
  const lessons = [m546TrojkatnyPlacZabawV1, m546DwieKlasyfikacjeL2V1];

  it("realizuje dwa różne pakiety planu z matematycznym tytułem i podstawą IX.1", () => {
    expect(section4LessonsWpC4.filter((lesson) => lesson.topicId === "M5-4.6")).toEqual(lessons);
    expect(lessons.map((lesson) => lesson.lessonNumber)).toEqual([1, 2]);
    lessons.forEach((lesson) => {
      expect(lesson.title).toBe("Rodzaje trójkątów");
      expect(lesson.stages[0]).toMatchObject({ title: "Cele lekcji (slajd 0)", board: { headline: "Rodzaje trójkątów" } });
      expect(lesson.learningGoals.flatMap((goal) => goal.curriculumReferences).some((reference) => reference.startsWith("IX.1"))).toBe(true);
    });
  });

  it.each(lessons.map((lesson) => [lesson.id, lesson] as const))("%s ma jeden slajd z pięcioma osobnymi zadaniami i identyczny finał", (_, lesson) => {
    const evidence = lesson.stages.filter((stage) => stage.questions.length === 5);
    expect(evidence).toHaveLength(1);
    expect(evidence[0]).toMatchObject({ title: "Ćwiczenia — 5 przykładów", board: { modelId: "geometry-lab" }, student: { modelId: "geometry-lab" } });
    expect(evidence[0]!.print?.items).toHaveLength(5);
    expect(new Set(evidence[0]!.questions.map((question) => question.id)).size).toBe(5);
    expect(lesson.stages.at(-1)).toMatchObject({ kind: "understanding", title: "Ocena umiejętności", understanding: { heading: "Ocena ucznia — co już potrafię?", evidenceStageId: evidence[0]!.id, selfAssessmentAffectsScore: false } });
  });

  it.each(lessons.map((lesson) => [lesson.id, lesson] as const))("%s używa dynamicznego modelu we wszystkich slajdach treści", (_, lesson) => {
    expect(lesson.stages.slice(1, -1)).toHaveLength(lesson.lessonNumber === 1 ? 7 : 4);
    lesson.stages.slice(1, -1).forEach((stage) => {
      expect(stage).toMatchObject({ board: { modelId: "geometry-lab" }, student: { modelId: "geometry-lab" } });
      expect(isTriangleTypesLessonSeed(stage.board.modelSeed ?? 0)).toBe(true);
    });
    expect(lessonChannelContractIssues(lesson)).toEqual([]);
  });

  it("L1 ma osobne slajdy obu podziałów, nazw boków, trójkąta prostokątnego i galerii", () => {
    expect(m546TrojkatnyPlacZabawV1.stages.map((stage) => stage.title)).toEqual(expect.arrayContaining([
      "Podział trójkątów ze względu na boki",
      "Podział trójkątów ze względu na kąty",
      "Podstawa i ramiona",
      "Boki trójkąta prostokątnego",
      "Rozpoznaj rodzaje trójkątów",
      "Obwód trójkąta",
    ]));
    expect(m546TrojkatnyPlacZabawV1.stages.find((stage) => stage.title === "Podział trójkątów ze względu na boki")?.board.modelSeed).toBe(460101);
    expect(m546TrojkatnyPlacZabawV1.stages.find((stage) => stage.title === "Podział trójkątów ze względu na kąty")?.board.modelSeed).toBe(461201);
    expect(m546TrojkatnyPlacZabawV1.stages.find((stage) => stage.title === "Podstawa i ramiona")?.board.modelSeed).toBe(460801);
    expect(m546TrojkatnyPlacZabawV1.stages.find((stage) => stage.title === "Boki trójkąta prostokątnego")?.board.modelSeed).toBe(460901);
    expect(m546TrojkatnyPlacZabawV1.stages.find((stage) => stage.title === "Rozpoznaj rodzaje trójkątów")?.board.modelSeed).toBe(461001);
    expect(m546TrojkatnyPlacZabawV1.stages.find((stage) => stage.title === "Obwód trójkąta")?.board.modelSeed).toBe(461101);
  });
});
