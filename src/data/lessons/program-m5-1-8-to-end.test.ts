import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { listLessonPackages } from "@/data/lessons/registry";
import { m51rElektrowniaLiczbV1 } from "@/data/lessons/section1-wp-c1bc";
import { buildLessonSessionSnapshot } from "@/lib/lessons/buildSessionSnapshot";

function isInCompletedRange(topicId: string) {
  const match = /^M5-(\d+)\.(\d+|R|S)$/.exec(topicId);
  if (!match) return false;
  const section = Number(match[1]);
  const topic = match[2]!;
  return section > 1 || (section === 1 && (topic === "R" || topic === "S" || Number(topic) >= 8));
}

describe("program od M5-1.8 do końca", () => {
  const lessons = listLessonPackages().filter((lesson) => isInCompletedRange(lesson.topicId));

  it("publikuje cały zakres programu", () => {
    expect(lessons.length).toBeGreaterThan(50);
    for (const lesson of lessons) expect(lesson.status, lesson.topicId).toBe("published");
  });

  it("każdy temat rozpoczyna slajdem celów i kończy podsumowaniem", () => {
    for (const lesson of lessons) {
      const first = lesson.stages[0];
      const last = lesson.stages.at(-1);
      expect(first?.board.modelId, `${lesson.topicId}: slajd otwierający`).toBe("exercise-board");
      expect(first?.live?.enabled, `${lesson.topicId}: otwarcie live`).toBe(true);
      expect(last?.id, `${lesson.topicId}: slajd zamykający`).toBe(`${lesson.topicId.toLowerCase().replace(/\./g, "-")}-understanding`);
      expect(last?.live, `${lesson.topicId}: podsumowanie`).toMatchObject({ enabled: true, kind: "quick-check" });
      expect(last?.student?.activityMode, `${lesson.topicId}: samoocena`).toBe("view");

      const { stageSnapshot } = buildLessonSessionSnapshot(lesson);
      expect(stageSnapshot.stages.length, `${lesson.topicId}: komplet slajdów w sesji`).toBe(lesson.stages.length);
    }
  });

  it("przenosi pełną treść zadań z karty na slajd ucznia", () => {
    for (const lesson of lessons) {
      for (const stage of lesson.stages) {
        const items = stage.print?.items ?? [];
        if (items.length === 0) continue;
        expect(stage.board.bullets, `${lesson.topicId}:${stage.id}`).toEqual(items.map((item) => `${item.expression} — ${item.prompt}`));
        expect(stage.student?.instruction.length, `${lesson.topicId}:${stage.id}`).toBeGreaterThan(30);
      }
    }
  });

  it("ma działający model dzielenia oceniający końcowy wynik", () => {
    const lesson = lessons.find((item) => item.topicId === "M5-1.8");
    const divisionStages = lesson?.stages.filter((stage) => stage.board.modelId === "written-division-lesson") ?? [];
    expect(divisionStages).toHaveLength(2);
    expect(divisionStages.map((stage) => stage.board.modelSeed)).toEqual([1, 2]);
    expect(divisionStages.every((stage) => stage.student?.activityMode === "respond")).toBe(true);
    expect(divisionStages.map((stage) => stage.questions.length)).toEqual([6, 6]);
    expect(divisionStages.flatMap((stage) => stage.questions).every((question) => question.generatorId === "written-division-v1")).toBe(true);
  });

  it("opisuje cele dzielenia pisemnego językiem podstawy programowej", () => {
    const lesson = lessons.find((item) => item.topicId === "M5-1.8");

    expect(lesson?.title).toBe("Działania pisemne — dzielenie");
    expect(lesson?.learningGoals.map((goal) => goal.studentGoal)).toEqual([
      "Nauczę się dzielić liczby naturalne przez liczby jednocyfrowe.",
      "Nauczę się dzielić liczby naturalne przez liczby dwucyfrowe.",
      "Nauczę się wykonywać dzielenie z resztą.",
      "Nauczę się sprawdzać wynik dzielenia.",
    ]);
    expect(JSON.stringify(lesson?.learningGoals)).not.toMatch(/wież|rozdzielni/i);
    expect(lesson?.stages.map((stage) => stage.title)).not.toEqual(expect.arrayContaining([
      "Sprawdzenie wyniku",
      "Zero w ilorazie",
      "Ćwicz",
      "Bilet wyjścia",
    ]));
  });

  it("ma cztery konkretne interaktywne zadania tekstowe", () => {
    const lesson = lessons.find((item) => item.topicId === "M5-1.9");
    const storyStages = lesson?.stages.filter((stage) => stage.board.modelId === "written-story-problems-lesson") ?? [];

    expect(lesson?.title).toBe("Zadania tekstowe");
    expect(storyStages.map((stage) => stage.board.modelSeed)).toEqual([1, 2, 3, 4]);
    expect(storyStages.map((stage) => stage.questions.length)).toEqual([1, 1, 1, 1]);
    expect(storyStages.every((stage) => stage.questions[0]?.generatorId === "written-story-problems-v1")).toBe(true);
  });

  it("ma sześć slajdów powtórki Działu I po cztery interaktywne mini-stacje", () => {
    const reviewStages = m51rElektrowniaLiczbV1.stages.filter(
      (stage) => stage.board.modelId === "section-one-review-lesson",
    );

    expect(reviewStages).toHaveLength(6);
    expect(reviewStages.map((stage) => stage.board.modelSeed)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(reviewStages.map((stage) => stage.questions.length)).toEqual([4, 4, 4, 4, 4, 4]);
    expect(
      reviewStages
        .flatMap((stage) => stage.questions)
        .every((question) => question.generatorId === "section-one-review-v1"),
    ).toBe(true);

    const { stageSnapshot } = buildLessonSessionSnapshot(m51rElektrowniaLiczbV1);
    const snapshotQuestions = stageSnapshot.stages
      .filter((stage) => stage.modelId === "section-one-review-lesson")
      .flatMap((stage) => stage.questions);
    expect(snapshotQuestions).toHaveLength(24);
    expect(snapshotQuestions.every((question) => question.generatorId === "section-one-review-v1")).toBe(true);
  });

  it("pokazuje na pierwszym slajdzie powtórki cele zgodne z podstawą programową", () => {
    const { stageSnapshot } = buildLessonSessionSnapshot(m51rElektrowniaLiczbV1);
    const openingStage = stageSnapshot.stages[0];

    expect(openingStage?.lessonTitle).toBe("Powtórzenie — liczby i działania");
    expect(openingStage?.learningGoals).toHaveLength(3);
    expect(openingStage?.learningGoals?.flatMap((goal) => goal.curriculumReferences)).toEqual([
      "Dział I — system dziesiątkowy: zapisywanie i odczytywanie liczb naturalnych wielocyfrowych, porównywanie liczb, interpretacja na osi liczbowej.",
      "Dział I — działania pamięciowe: dodawanie, odejmowanie, mnożenie i dzielenie liczb naturalnych w pamięci w prostych przypadkach.",
      "Dział I — potęgowanie: obliczanie drugiej i trzeciej potęgi liczb naturalnych.",
      "Dział I — kolejność wykonywania działań: nawiasy, potęgi, mnożenie i dzielenie, dodawanie i odejmowanie.",
    ]);
    expect(JSON.stringify(openingStage?.learningGoals)).not.toMatch(/misj|stacj|elektrowni|dekoder|reaktor/i);
  });

  it("wszystkie przypisane ilustracje istnieją w katalogu publicznym", () => {
    const illustratedStages = lessons.flatMap((lesson) => lesson.stages.filter((stage) => stage.board.illustrationSrc));
    expect(illustratedStages.length).toBeGreaterThan(0);
    for (const stage of illustratedStages) {
      expect(existsSync(resolve("public", stage.board.illustrationSrc!.replace(/^\//, ""))), stage.board.illustrationSrc).toBe(true);
      expect(stage.board.illustrationAlt?.length, stage.id).toBeGreaterThan(20);
    }
  });
});
