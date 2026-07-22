import { describe, expect, it } from "vitest";
import { section6LessonsWpC6 } from "@/data/lessons/section6-wp-c6";
import { triangleAreaActivityFromStageId } from "@/lib/math/area/triangleArea";

describe("temat Pole trójkąta", () => {
  const lesson = section6LessonsWpC6.find((item) => item.topicId === "M5-6.5");
  const activityStages = lesson?.stages.filter((stage) => stage.board.modelId === "triangle-area-lab") ?? [];

  it("ma cztery slajdy w kolejności: wysokość, wzór, obliczenia i zadania tekstowe", () => {
    expect(lesson?.title).toBe("Pole trójkąta");
    expect(lesson?.learningGoals?.map((goal) => goal.studentGoal)).toEqual([
      "Nauczę się wskazywać podstawę i odpowiadającą jej wysokość w trójkącie.",
      "Nauczę się obliczać pole trójkąta.",
    ]);
    expect(activityStages.map((stage) => triangleAreaActivityFromStageId(stage.id))).toEqual([
      "base-height",
      "area-formula",
      "area-calculations",
      "area-stories",
    ]);
  });

  it("udostępnia model na tablicy i tablecie", () => {
    for (const stage of activityStages) {
      expect(stage.board.modelId).toBe("triangle-area-lab");
      expect(stage.student?.modelId).toBe("triangle-area-lab");
    }
  });
});
