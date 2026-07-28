import { describe, expect, it } from "vitest";
import { m627PowtorzenieV1 } from "@/data/lessons/m6-2-7-powtorzenie";
import { getLessonPackageForTopic } from "@/data/lessons/registry";
import {
  PLANE_FIGURES_REVIEW_ANGLE_TASKS,
  PLANE_FIGURES_REVIEW_CHALLENGE_TASKS,
  PLANE_FIGURES_REVIEW_LENGTH_TASKS,
} from "@/lib/math/geometry/planeFiguresReview";

describe("M6-2.7 Powtórzenie wiadomości", () => {
  it("publikuje pełną lekcję zamiast szkieletu", () => {
    expect(getLessonPackageForTopic("M6-2.7")?.id).toBe(m627PowtorzenieV1.id);
    expect(m627PowtorzenieV1.status).toBe("published");
  });

  it("zawiera trzy stałe serie zadań tekstowych", () => {
    const taskStages = m627PowtorzenieV1.stages.filter((stage) => stage.student?.modelId === "plane-figures-review-lab");
    expect(taskStages).toHaveLength(3);
    expect(taskStages.every((stage) => stage.questions.length === 1)).toBe(true);
    expect(PLANE_FIGURES_REVIEW_LENGTH_TASKS).toHaveLength(6);
    expect(PLANE_FIGURES_REVIEW_ANGLE_TASKS).toHaveLength(5);
    expect(PLANE_FIGURES_REVIEW_CHALLENGE_TASKS).toHaveLength(4);
  });

  it("nie powtarza treści zadań w żadnej serii", () => {
    const tasks = [
      ...PLANE_FIGURES_REVIEW_LENGTH_TASKS,
      ...PLANE_FIGURES_REVIEW_ANGLE_TASKS,
      ...PLANE_FIGURES_REVIEW_CHALLENGE_TASKS,
    ];
    expect(new Set(tasks.map((task) => task.story)).size).toBe(tasks.length);
  });
});
