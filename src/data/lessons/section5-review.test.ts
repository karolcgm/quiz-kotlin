import { describe, expect, it } from "vitest";
import { section5LessonsWpC5 } from "@/data/lessons/section5-wp-c5";

describe("powtórzenie wiadomości o ułamkach dziesiętnych", () => {
  const lesson = section5LessonsWpC5.find((item) => item.topicId === "M5-5.R")!;
  const taskStages = lesson.stages.filter((stage) => stage.board.modelId === "decimal-notation-l1");

  it("ma sześć interaktywnych serii z całego działu", () => {
    expect(lesson.title).toBe("Powtórzenie wiadomości o ułamkach dziesiętnych");
    expect(taskStages).toHaveLength(6);
    expect(taskStages.reduce((sum, stage) => sum + stage.questions.length, 0)).toBe(31);
  });

  it("każdy slajd przechowuje serię pytań zamiast osobnych slajdów dla przykładów", () => {
    for (const stage of taskStages) {
      expect(stage.questions.length).toBeGreaterThanOrEqual(5);
      expect(new Set(stage.questions.map((question) => question.id)).size).toBe(stage.questions.length);
      expect(stage.student?.modelId).toBe("decimal-notation-l1");
    }
  });
});
