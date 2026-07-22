import { describe, expect, it } from "vitest";
import { section6LessonsWpC6 } from "@/data/lessons/section6-wp-c6";
import { trapezoidAreaActivityFromStageId } from "@/lib/math/area/trapezoidArea";

describe("temat Pole trapezu", () => {
  const lesson = section6LessonsWpC6.find((item) => item.topicId === "M5-6.6");
  const activityStages = lesson?.stages.filter((stage) => stage.board.modelId === "trapezoid-area-lab") ?? [];

  it("ma cztery slajdy: części, wzór, obliczenia i zadania tekstowe", () => {
    expect(lesson?.title).toBe("Pole trapezu");
    expect(lesson?.learningGoals?.map((goal) => goal.studentGoal)).toEqual([
      "Nauczę się rozpoznawać podstawy, ramiona i wysokość trapezu.",
      "Nauczę się obliczać pole trapezu.",
    ]);
    expect(activityStages.map((stage) => trapezoidAreaActivityFromStageId(stage.id))).toEqual([
      "trapezoid-parts",
      "trapezoid-formula",
      "trapezoid-calculations",
      "trapezoid-stories",
    ]);
  });

  it("udostępnia model na tablicy i tablecie", () => {
    for (const stage of activityStages) {
      expect(stage.board.modelId).toBe("trapezoid-area-lab");
      expect(stage.student?.modelId).toBe("trapezoid-area-lab");
    }
  });
});
