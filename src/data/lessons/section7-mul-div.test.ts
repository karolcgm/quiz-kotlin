import { describe, expect, it } from "vitest";
import { integerMulDivActivityFromStageId } from "@/components/lessons/models/IntegerMulDivLessonLab";
import { section7LessonsWpC7 } from "@/data/lessons/section7-wp-c7";

describe("temat Mnożenie i dzielenie liczb całkowitych", () => {
  const lesson = section7LessonsWpC7.find((item) => item.topicId === "M5-7.4");
  const stages = lesson?.stages.filter((stage) => stage.board.modelId === "integer-mul-div-lab") ?? [];

  it("zaczyna od tabeli znaków, a potem prowadzi przez mnożenie i dzielenie", () => {
    expect(lesson?.title).toBe("Mnożenie i dzielenie liczb całkowitych");
    expect(stages.map((stage) => integerMulDivActivityFromStageId(stage.id))).toEqual([
      "sign-table", "multiplication", "division", "mixed", "stories",
    ]);
  });

  it("ma ten sam interaktywny model na tablicy i tablecie", () => {
    for (const stage of stages) {
      expect(stage.student?.modelId).toBe("integer-mul-div-lab");
      expect(stage.questions).toHaveLength(1);
      expect(stage.questions[0]?.generatorId).toBe("integer-mul-div-l1-v1");
    }
  });
});
