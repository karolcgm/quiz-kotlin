import { describe, expect, it } from "vitest";
import { listPublishedLessonPackages } from "@/data/lessons/registry";
import { buildLessonSessionSnapshot } from "@/lib/lessons/buildSessionSnapshot";

describe("cele lekcji i kryteria sukcesu", () => {
  it("każda opublikowana lekcja ma cele z przypisanymi kryteriami", () => {
    for (const lesson of listPublishedLessonPackages()) {
      expect(lesson.learningGoals.length, lesson.id).toBeGreaterThan(0);
      for (const goal of lesson.learningGoals) {
        expect(goal.studentGoal, lesson.id).toMatch(/^(Nauczę się|Przypomnę sobie|Rozwinę|Zrozumiem|Będę)/);
        expect(goal.successCriteria.length, `${lesson.id}:${goal.id}`).toBeGreaterThan(0);
      }
    }
  });

  it("umieszcza temat, cele i kryteria w pierwszym slajdzie sesji", () => {
    const lesson = listPublishedLessonPackages().find((item) => item.topicId === "M5-1.1");
    expect(lesson).toBeDefined();
    const { stageSnapshot } = buildLessonSessionSnapshot(lesson!);
    expect(stageSnapshot.stages[0]?.lessonTitle).toBe(lesson!.title);
    expect(stageSnapshot.stages[0]?.learningGoals).toEqual(lesson!.learningGoals);
  });

  it("każdy interaktywny temat ucznia ma co najmniej jedno zapisywane pytanie", () => {
    for (const lesson of listPublishedLessonPackages()) {
      const { stageSnapshot } = buildLessonSessionSnapshot(lesson);
      for (const stage of stageSnapshot.stages) {
        if (stage.studentActivityMode !== "respond") continue;
        expect(stage.studentModelId, `${lesson.id}:${stage.id}`).toBeTruthy();
        expect(stage.questions.length, `${lesson.id}:${stage.id}`).toBeGreaterThan(0);
      }
    }
  });
});
