import { describe, expect, it } from "vitest";
import { section6LessonsWpC6 } from "@/data/lessons/section6-wp-c6";
import { areaUnitConversionActivityFromStageId, parsePolishDecimal } from "@/lib/math/area/unitConversion";

describe("M5-6.2 Zależności między jednostkami", () => {
  const lesson = section6LessonsWpC6.find((candidate) => candidate.topicId === "M5-6.2");

  it("ma jeden cel i dwa schematy oraz dwie serie zadań", () => {
    expect(lesson?.title).toBe("Zależności między jednostkami");
    expect(lesson?.learningGoals).toHaveLength(1);
    expect(lesson?.learningGoals[0].studentGoal).toBe("Nauczę się zamieniać jednostki długości i pola.");

    const stages = lesson?.stages.filter((stage) => stage.board.modelId === "area-unit-conversion-lab") ?? [];
    expect(stages.map((stage) => stage.title)).toEqual([
      "Jednostki długości",
      "Jednostki pola",
      "Zamiana jednostek długości",
      "Zamiana jednostek pola",
    ]);
  });

  it("mapuje slajdy i odczytuje polski przecinek", () => {
    expect(areaUnitConversionActivityFromStageId("m5-6-2-s1")).toBe("length-relations");
    expect(areaUnitConversionActivityFromStageId("m5-6-2-s2")).toBe("area-relations");
    expect(areaUnitConversionActivityFromStageId("m5-6-2-s3")).toBe("length-conversions");
    expect(areaUnitConversionActivityFromStageId("m5-6-2-s4")).toBe("area-conversions");
    expect(parsePolishDecimal("5,6")).toBe(5.6);
    expect(parsePolishDecimal("2,5")).toBe(2.5);
  });
});
