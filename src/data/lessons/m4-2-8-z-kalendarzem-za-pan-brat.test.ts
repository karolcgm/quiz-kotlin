import { describe, expect, it } from "vitest";
import { m428ZKalendarzemZaPanBratV1 } from "@/data/lessons/m4-2-8-z-kalendarzem-za-pan-brat";

describe("M4-2.8 Z kalendarzem za pan brat", () => {
  it("is a complete published lesson with three balanced goals", () => {
    expect(m428ZKalendarzemZaPanBratV1.status).toBe("published");
    expect(m428ZKalendarzemZaPanBratV1.learningGoals).toHaveLength(3);
    expect(m428ZKalendarzemZaPanBratV1.learningGoals.every((goal) => goal.successCriteria.length === 1)).toBe(true);
    expect(m428ZKalendarzemZaPanBratV1.stages[0]?.title).toBe("Cele lekcji (slajd 0)");
    expect(m428ZKalendarzemZaPanBratV1.stages.at(-1)?.kind).toBe("understanding");
  });

  it("keeps every exercise series in a single stable model stage", () => {
    const stages = m428ZKalendarzemZaPanBratV1.stages.filter((stage) => stage.board.modelId === "grade4-calendar-lab");
    expect(stages).toHaveLength(6);
    expect(stages.flatMap((stage) => stage.questions)).toHaveLength(19);
    expect(stages.flatMap((stage) => stage.questions).every((question) => question.generatorId === "grade4-calendar-l1-v1")).toBe(true);
  });
});
