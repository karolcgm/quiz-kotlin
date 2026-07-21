import { describe, expect, it } from "vitest";
import { section6LessonsWpC6 } from "@/data/lessons/section6-wp-c6";
import { rectangleSquareAreaActivityFromStageId } from "@/lib/math/area/rectangleSquareArea";

describe("M5-6.1 Pole prostokąta i kwadratu", () => {
  const lesson = section6LessonsWpC6.find((candidate) => candidate.topicId === "M5-6.1");

  it("ma bezpośrednią nazwę, jeden cel i pięć spójnych slajdów tematycznych", () => {
    expect(lesson).toBeDefined();
    expect(lesson?.title).toBe("Pole prostokąta i kwadratu");
    expect(lesson?.learningGoals).toHaveLength(1);
    expect(lesson?.learningGoals[0].studentGoal).toBe("Nauczę się obliczać pole prostokąta i kwadratu.");

    const areaStages = lesson?.stages.filter((stage) => stage.board.modelId === "rectangle-square-area-lab") ?? [];
    expect(areaStages.map((stage) => stage.title)).toEqual([
      "Co to jest pole?",
      "Pole na kratownicy",
      "Wzory i jednostki pola",
      "Obliczanie pola",
      "Zadania tekstowe",
    ]);
  });

  it("mapuje każdy slajd na właściwą aktywność", () => {
    expect(rectangleSquareAreaActivityFromStageId("m5-6-1-s1")).toBe("area-definition");
    expect(rectangleSquareAreaActivityFromStageId("m5-6-1-s2")).toBe("area-grid");
    expect(rectangleSquareAreaActivityFromStageId("m5-6-1-s3")).toBe("area-formulas");
    expect(rectangleSquareAreaActivityFromStageId("m5-6-1-s4")).toBe("area-calculations");
    expect(rectangleSquareAreaActivityFromStageId("m5-6-1-s5")).toBe("area-stories");
  });
});
