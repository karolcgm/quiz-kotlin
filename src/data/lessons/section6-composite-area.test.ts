import { describe, expect, it } from "vitest";
import { section6LessonsWpC6 } from "@/data/lessons/section6-wp-c6";
import { compositeAreaActivityFromStageId } from "@/lib/math/area/compositeArea";

describe("temat Pola wielokątów", () => {
  const lesson = section6LessonsWpC6.find((item) => item.topicId === "M5-6.7");
  const activityStages = lesson?.stages.filter((stage) => stage.board.modelId === "composite-area-lab") ?? [];

  it("ma przypomnienie wzorów oraz trzy slajdy pracy na kratownicy", () => {
    expect(lesson?.title).toBe("Pola wielokątów");
    expect(activityStages.map((stage) => compositeAreaActivityFromStageId(stage.id))).toEqual([
      "formula-recap",
      "guided-split",
      "grid-practice",
      "grid-challenge",
    ]);
  });

  it("udostępnia interaktywną kratownicę na tablicy i tablecie", () => {
    for (const stage of activityStages) {
      expect(stage.board.modelId).toBe("composite-area-lab");
      expect(stage.student?.modelId).toBe("composite-area-lab");
    }
  });
});
