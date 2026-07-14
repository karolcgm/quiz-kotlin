import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { listLessonPackages } from "@/data/lessons/registry";
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
    const division = lesson?.stages.find((stage) => stage.board.modelId === "written-division-lesson");
    expect(division?.student?.activityMode).toBe("respond");
    expect(division?.questions).toHaveLength(4);
    expect(division?.questions.every((question) => question.generatorId === "written-division-v1")).toBe(true);
  });

  it("wszystkie przypisane ilustracje istnieją w katalogu publicznym", () => {
    const illustratedStages = lessons.flatMap((lesson) => lesson.stages.filter((stage) => stage.board.illustrationSrc));
    expect(illustratedStages.length).toBeGreaterThanOrEqual(5);
    for (const stage of illustratedStages) {
      expect(existsSync(resolve("public", stage.board.illustrationSrc!.replace(/^\//, ""))), stage.board.illustrationSrc).toBe(true);
      expect(stage.board.illustrationAlt?.length, stage.id).toBeGreaterThan(20);
    }
  });
});
