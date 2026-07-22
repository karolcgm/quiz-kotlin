import { describe, expect, it } from "vitest";
import { section6LessonsWpC6 } from "@/data/lessons/section6-wp-c6";

describe("powtórzenie wiadomości o polach", () => {
  const lesson = section6LessonsWpC6.find((item) => item.topicId === "M5-6.R");
  const activityStages = lesson?.stages.filter((stage) => stage.board.modelId === "area-review-lab" || stage.board.modelId === "composite-area-lab") ?? [];

  it("obejmuje wszystkie główne umiejętności działu", () => {
    expect(lesson?.title).toBe("Powtórzenie wiadomości o polach");
    expect(activityStages.map((stage) => stage.title)).toEqual([
      "Pola znanych figur",
      "Jednostki pola",
      "Brakujący bok, wysokość lub obwód",
      "Zadania z treścią",
      "Wielokąty na kratownicy",
    ]);
  });

  it("ma modele zadań na tablicy i tablecie", () => {
    for (const stage of activityStages) {
      expect(stage.board.modelId).toMatch(/^(?:area-review-lab|composite-area-lab)$/u);
      expect(stage.student?.modelId).toBe(stage.board.modelId);
    }
  });
});
