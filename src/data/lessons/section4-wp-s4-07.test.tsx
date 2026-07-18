/** @vitest-environment jsdom */
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { LessonStageView } from "@/components/lessons/LessonStageView";
import {
  m547CzyOdcinkiSieZamknaL1V1,
  m547DwaOkregiMozliwosciL2V1,
  section4LessonsWpC4,
} from "@/data/lessons/section4-wp-c4";
import { lessonChannelContractIssues } from "@/lib/lessons/lessonRuntime";
import { buildLessonSessionSnapshot } from "@/lib/lessons/buildSessionSnapshot";
import { TRIANGLE_CONSTRUCTION_LESSON_SEEDS, isTriangleConstructionLessonSeed } from "@/lib/math/geometry/triangleConstruction";

afterEach(cleanup);

describe("WP-S4-07 — Konstrukcja trójkąta o danych bokach L1/L2", () => {
  const lessons = [m547CzyOdcinkiSieZamknaL1V1, m547DwaOkregiMozliwosciL2V1];

  it("realizuje dwa pakiety z tytułem podstawy programowej IX.2", () => {
    expect(section4LessonsWpC4.filter((lesson) => lesson.topicId === "M5-4.7")).toEqual(lessons);
    expect(lessons.map((lesson) => lesson.lessonNumber)).toEqual([1, 2]);
    lessons.forEach((lesson) => {
      expect(lesson.title).toBe("Konstrukcja trójkąta o danych bokach");
      expect(lesson.stages[0]).toMatchObject({ title: "Cele lekcji (slajd 0)", board: { headline: "Konstrukcja trójkąta o danych bokach" } });
      expect(lesson.learningGoals.flatMap((goal) => goal.curriculumReferences).some((reference) => reference.startsWith("IX.2"))).toBe(true);
    });
  });

  it.each(lessons.map((lesson) => [lesson.id, lesson] as const))("%s nie zawiera zdublowanego slajdu z pięcioma przykładami", (_, lesson) => {
    expect(lesson.stages.some((stage) => stage.title === "Ćwiczenia — 5 przykładów")).toBe(false);
    const evidence = lesson.stages.find((stage) => stage.kind === "practice")!;
    expect(evidence.title).toBe(lesson.lessonNumber === 1 ? "Sprawdź warunek budowy trójkąta" : "Samodzielna konstrukcja trójkąta");
    expect(lesson.stages.at(-1)).toMatchObject({
      kind: "understanding",
      title: "Ocena umiejętności",
      understanding: {
        heading: "Ocena ucznia — co już potrafię?",
        evidenceStageId: evidence.id,
        selfAssessmentAffectsScore: false,
      },
    });
  });

  it.each(lessons.map((lesson) => [lesson.id, lesson] as const))("%s używa jednego dynamicznego modelu na wszystkich slajdach treści", (_, lesson) => {
    expect(lesson.stages.slice(1, -1)).toHaveLength(3);
    lesson.stages.slice(1, -1).forEach((stage) => {
      expect(stage).toMatchObject({ board: { modelId: "geometry-lab" }, student: { modelId: "geometry-lab" } });
      expect(isTriangleConstructionLessonSeed(stage.board.modelSeed ?? 0)).toBe(true);
    });
    expect(lessonChannelContractIssues(lesson)).toEqual([]);
  });

  it("renderuje wyspecjalizowany model na tablicy i tablecie", () => {
    const stage = m547DwaOkregiMozliwosciL2V1.stages[1]!;
    const board = render(<LessonStageView lessonId={m547DwaOkregiMozliwosciL2V1.id} stage={stage} channel="board" revealIndex={0} />);
    expect(board.container.querySelector("[data-triangle-construction-lab]")).toBeInTheDocument();
    cleanup();
    const tablet = render(<LessonStageView lessonId={m547DwaOkregiMozliwosciL2V1.id} stage={stage} channel="student" revealIndex={0} />);
    expect(tablet.container.querySelector("[data-triangle-construction-lab]")).toBeInTheDocument();
  });

  it("L1 zaczyna od serii decyzji, a potem pokazuje konstrukcję z cyrklem", () => {
    const contentStages = m547CzyOdcinkiSieZamknaL1V1.stages.slice(1, -1);
    expect(contentStages[0]).toMatchObject({
      title: "Warunek istnienia trójkąta",
      board: { modelSeed: TRIANGLE_CONSTRUCTION_LESSON_SEEDS["feasibility-series"].support },
      student: { modelSeed: TRIANGLE_CONSTRUCTION_LESSON_SEEDS["feasibility-series"].support },
    });
    expect(contentStages[1]).toMatchObject({
      title: "Konstrukcja trójkąta krok po kroku",
      board: { modelSeed: TRIANGLE_CONSTRUCTION_LESSON_SEEDS["visual-construction"].support },
      student: { modelSeed: TRIANGLE_CONSTRUCTION_LESSON_SEEDS["visual-construction"].support },
    });
    expect(m547CzyOdcinkiSieZamknaL1V1.skillIds).toContain("M5-4.7-compass-construction");
  });

  it("nie publikuje usuniętego slajdu w snapshotcie sesji", () => {
    const snapshot = buildLessonSessionSnapshot(m547CzyOdcinkiSieZamknaL1V1).stageSnapshot;
    expect(snapshot.stages.some((stage) => stage.title === "Ćwiczenia — 5 przykładów")).toBe(false);
    expect(snapshot.stages).toHaveLength(5);
  });
});
