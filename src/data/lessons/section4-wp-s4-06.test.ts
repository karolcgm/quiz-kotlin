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

  it("L1 prowadzi pięć obwodów wewnątrz jednego modelu bez przełączania na stare aktywności", () => {
    const evidence = m546TrojkatnyPlacZabawV1.stages.find((stage) => stage.title === "Obwód i brakujący bok — 5 zadań");
    expect(evidence).toMatchObject({ board: { modelId: "geometry-lab", modelSeed: 460701 }, student: { modelId: "geometry-lab", modelSeed: 460701 } });
    expect(evidence?.questions).toHaveLength(1);
    expect(evidence?.questions[0]?.seed).toBe(460701);
    expect(evidence?.print?.items).toHaveLength(5);
    const expressions = evidence?.print?.items?.map((item) => item.expression).join(" ") ?? "";
    expect(expressions).toContain("10½ cm");
    expect(expressions).toContain("3¼ cm");
    expect(expressions).not.toMatch(/10 1\/2|3 1\/4/u);
    expect(m546TrojkatnyPlacZabawV1.stages.at(-1)).toMatchObject({ kind: "understanding", title: "Ocena umiejętności", understanding: { heading: "Ocena ucznia — co już potrafię?", evidenceStageId: evidence?.id, selfAssessmentAffectsScore: false } });
  });

  it("L2 zachowuje pięć osobnych zadań klasyfikacyjnych", () => {
    const evidence = m546DwieKlasyfikacjeL2V1.stages.find((stage) => stage.title === "Klasyfikacja trójkątów — 5 zadań");
    expect(evidence).toMatchObject({ board: { modelId: "geometry-lab" }, student: { modelId: "geometry-lab" } });
    expect(evidence?.questions).toHaveLength(5);
    expect(new Set(evidence?.questions.map((question) => question.id)).size).toBe(5);
    expect(evidence?.print?.items).toHaveLength(5);
    expect(m546DwieKlasyfikacjeL2V1.stages.at(-1)).toMatchObject({ kind: "understanding", title: "Ocena umiejętności", understanding: { heading: "Ocena ucznia — co już potrafię?", evidenceStageId: evidence?.id, selfAssessmentAffectsScore: false } });
  });

  it.each(lessons.map((lesson) => [lesson.id, lesson] as const))("%s używa dynamicznego modelu we wszystkich slajdach treści", (_, lesson) => {
    expect(lesson.stages.slice(1, -1)).toHaveLength(lesson.lessonNumber === 1 ? 6 : 4);
    lesson.stages.slice(1, -1).forEach((stage) => {
      expect(stage).toMatchObject({ board: { modelId: "geometry-lab" }, student: { modelId: "geometry-lab" } });
      expect(isTriangleTypesLessonSeed(stage.board.modelSeed ?? 0)).toBe(true);
    });
    expect(lessonChannelContractIssues(lesson)).toEqual([]);
  });

  it("L1 ma osobne slajdy obu podziałów, boków trójkąta prostokątnego i galerii", () => {
    expect(m546TrojkatnyPlacZabawV1.stages.map((stage) => stage.title)).toEqual(expect.arrayContaining([
      "Podział trójkątów ze względu na boki",
      "Podział trójkątów ze względu na kąty",
      "Boki trójkąta prostokątnego",
      "Klasyfikacja trójkątów według boków i kątów",
      "Obwód trójkąta",
    ]));
    expect(m546TrojkatnyPlacZabawV1.stages.find((stage) => stage.title === "Podział trójkątów ze względu na boki")?.board.modelSeed).toBe(460101);
    expect(m546TrojkatnyPlacZabawV1.stages.find((stage) => stage.title === "Podział trójkątów ze względu na kąty")?.board.modelSeed).toBe(461201);
    expect(m546TrojkatnyPlacZabawV1.stages.some((stage) => stage.title === "Podstawa i ramiona")).toBe(false);
    expect(m546TrojkatnyPlacZabawV1.stages.find((stage) => stage.title === "Boki trójkąta prostokątnego")?.board.modelSeed).toBe(460901);
    expect(m546TrojkatnyPlacZabawV1.stages.find((stage) => stage.title === "Klasyfikacja trójkątów według boków i kątów")?.board.modelSeed).toBe(461001);
    expect(m546TrojkatnyPlacZabawV1.stages.find((stage) => stage.title === "Obwód trójkąta")?.board.modelSeed).toBe(461101);
    expect(m546TrojkatnyPlacZabawV1.stages.find((stage) => stage.title === "Obwód i brakujący bok — 5 zadań")).toMatchObject({
      board: {
        modelSeed: 460701,
        headline: "Pięć zadań tekstowych bez rysunków",
        body: expect.stringContaining("pustą kratkę"),
      },
      student: { instruction: expect.stringContaining("Nie korzystaj z gotowego rysunku") },
    });
  });
});
