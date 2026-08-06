import { describe, expect, it } from "vitest";
import { m631KalendarzICzasV1 } from "@/data/lessons/m6-3-1-kalendarz-i-czas";
import { getLessonPackageForTopic } from "@/data/lessons/registry";

describe("M6-3.1 Kalendarz i czas", () => {
  it("publikuje pełną lekcję zamiast szkieletu", () => {
    expect(getLessonPackageForTopic("M6-3.1")?.id).toBe(m631KalendarzICzasV1.id);
    expect(m631KalendarzICzasV1.status).toBe("published");
  });

  it("zawiera kartę informacyjną i pięć spójnych serii zadań", () => {
    const stages = m631KalendarzICzasV1.stages.filter((stage) => stage.student?.modelId === "calendar-time-lab");
    expect(stages).toHaveLength(6);
    expect(stages[0].questions).toHaveLength(0);
    expect(stages.slice(1).every((stage) => stage.questions.length === 1)).toBe(true);
  });

  it("ma krótkie cele odpowiadające treści tematu", () => {
    const criteria = m631KalendarzICzasV1.learningGoals.flatMap((goal) => goal.successCriteria);
    expect(m631KalendarzICzasV1.learningGoals).toHaveLength(3);
    expect(criteria).toHaveLength(3);
    expect(criteria.join(" ")).toMatch(/rok przestępny/i);
    expect(criteria.join(" ")).toMatch(/godziny i minuty/i);
  });
});
