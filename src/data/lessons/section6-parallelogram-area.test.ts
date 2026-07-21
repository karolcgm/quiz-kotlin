import { describe, expect, it } from "vitest";
import { section6LessonsWpC6 } from "@/data/lessons/section6-wp-c6";
import {
  PARALLELOGRAM_CALCULATION_TASKS,
  PARALLELOGRAM_STORY_TASKS,
  parallelogramAreaActivityFromStageId,
} from "@/lib/math/area/parallelogramArea";

describe("temat Pole równoległoboku", () => {
  const lesson = section6LessonsWpC6.find((item) => item.topicId === "M5-6.3");
  const activityStages = lesson?.stages.filter((stage) => stage.board.modelId === "parallelogram-area-lab") ?? [];

  it("ma dwa krótkie cele i cztery dedykowane slajdy", () => {
    expect(lesson?.title).toBe("Pole równoległoboku");
    expect(lesson?.learningGoals).toHaveLength(2);
    expect(lesson?.learningGoals.map((goal) => goal.studentGoal)).toEqual([
      "Nauczę się wskazywać podstawę i odpowiadającą jej wysokość w równoległoboku.",
      "Nauczę się obliczać pole równoległoboku.",
    ]);
    expect(activityStages).toHaveLength(4);
  });

  it("mapuje slajdy na właściwe aktywności", () => {
    expect(activityStages.map((stage) => parallelogramAreaActivityFromStageId(stage.id))).toEqual([
      "base-height",
      "area-formula",
      "area-calculations",
      "area-stories",
    ]);
  });

  it("zawiera trudniejsze obliczenia, zamiany jednostek i zadanie o boku 4 cm oraz brakującej wysokości", () => {
    expect(PARALLELOGRAM_CALCULATION_TASKS).toHaveLength(12);
    expect(PARALLELOGRAM_CALCULATION_TASKS).toContainEqual(expect.objectContaining({
      id: "decoy-and-conversion",
      otherSideLabel: "b = 9 cm",
      answerFields: expect.arrayContaining([
        expect.objectContaining({ id: "converted-height", answer: 7, unit: "cm" }),
        expect.objectContaining({ id: "area", answer: 84, unit: "cm²" }),
      ]),
    }));
    expect(PARALLELOGRAM_CALCULATION_TASKS).toContainEqual(expect.objectContaining({
      id: "missing-base-with-decoy",
      centerLabel: "P = 72 dm²",
      otherSideLabel: "b = 12 dm",
      answerFields: [expect.objectContaining({ id: "base", answer: 9, unit: "dm" })],
    }));
    expect(PARALLELOGRAM_STORY_TASKS).toHaveLength(8);
    expect(PARALLELOGRAM_STORY_TASKS).toContainEqual(expect.objectContaining({
      id: "missing-height-four",
      answer: 7,
      baseStamp: "a = 4 cm",
      heightStamp: "h = ?",
    }));
  });
});
