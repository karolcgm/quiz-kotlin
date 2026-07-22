import { describe, expect, it } from "vitest";
import { section7LessonsWpC7 } from "@/data/lessons/section7-wp-c7";
import { integerAddSubtractActivityFromStageId } from "@/components/lessons/models/IntegerAddSubtractLessonLab";

describe("temat Dodawanie i odejmowanie liczb całkowitych", () => {
  const lesson = section7LessonsWpC7.find((item) => item.topicId === "M5-7.2");
  const stages = lesson?.stages.filter((stage) => stage.board.modelId === "integer-add-subtract-lab") ?? [];

  it("łączy dodawanie i odejmowanie w jeden sześcioetapowy temat", () => {
    expect(lesson?.title).toBe("Dodawanie i odejmowanie liczb całkowitych");
    expect(stages.map((stage) => integerAddSubtractActivityFromStageId(stage.id))).toEqual([
      "signs", "different-signs", "same-signs", "subtraction", "practice", "stories",
    ]);
    expect(section7LessonsWpC7.some((item) => item.topicId === "M5-7.3")).toBe(false);
  });

  it("ma model na tablicy i tablecie oraz pytanie, które zalicza każdy etap", () => {
    for (const stage of stages) {
      expect(stage.student?.modelId).toBe("integer-add-subtract-lab");
      expect(stage.questions).toHaveLength(1);
      expect(stage.questions[0]?.generatorId).toBe("integer-add-subtract-l1-v1");
    }
  });
});
