import { describe, expect, it } from "vitest";
import { section7LessonsWpC7 } from "@/data/lessons/section7-wp-c7";
import { integerNumbersActivityFromStageId } from "@/components/lessons/models/IntegerNumbersLessonLab";

describe("temat Liczby ujemne i dodatnie", () => {
  const lesson = section7LessonsWpC7.find((item) => item.topicId === "M5-7.1");
  const stages = lesson?.stages.filter((stage) => stage.board.modelId === "integer-numbers-lab") ?? [];

  it("ma sześć interaktywnych etapów: oś, wybieranie, mapa, znaki i liczby przeciwne", () => {
    expect(lesson?.title).toBe("Liczby ujemne i dodatnie");
    expect(stages.map((stage) => integerNumbersActivityFromStageId(stage.id))).toEqual([
      "integer-introduction",
      "integer-number-line",
      "integer-select",
      "integer-temperatures",
      "integer-compare",
      "integer-opposites",
    ]);
  });

  it("udostępnia ten sam model na tablicy i tablecie oraz ma pytanie do zaliczenia każdego etapu", () => {
    for (const stage of stages) {
      expect(stage.board.modelId).toBe("integer-numbers-lab");
      expect(stage.student?.modelId).toBe("integer-numbers-lab");
      expect(stage.questions).toHaveLength(1);
      expect(stage.questions[0]?.generatorId).toBe("integer-numbers-l1-v1");
    }
  });
});
