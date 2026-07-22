import { describe, expect, it } from "vitest";
import { section6LessonsWpC6 } from "@/data/lessons/section6-wp-c6";

describe("temat Pole rombu", () => {
  const lesson = section6LessonsWpC6.find((item) => item.topicId === "M5-6.4");
  const activityStages = lesson?.stages.filter((stage) => stage.board.modelId === "rhombus-area-lab") ?? [];

  it("ma właściwy tytuł, dwa cele i cztery interaktywne slajdy", () => {
    expect(lesson?.title).toBe("Pole rombu");
    expect(lesson?.learningGoals?.map((goal) => goal.studentGoal)).toEqual([
      "Nauczę się rozpoznawać dwa sposoby przedstawiania rombu.",
      "Nauczę się obliczać pole rombu dwoma sposobami.",
    ]);
    expect(activityStages).toHaveLength(4);
    expect(activityStages.map((stage) => stage.title)).toEqual([
      "Dwa ustawienia rombu",
      "Dwa wzory na pole rombu",
      "Obliczanie pola rombu",
      "Zadania tekstowe z polem rombu",
    ]);
  });

  it("udostępnia ten sam model na tablicy i tablecie", () => {
    for (const stage of activityStages) {
      expect(stage.board.modelId).toBe("rhombus-area-lab");
      expect(stage.student?.modelId).toBe("rhombus-area-lab");
    }
  });
});
