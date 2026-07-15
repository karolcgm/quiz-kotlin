import { describe, expect, it } from "vitest";
import { mapStudentLearningPlanRow } from "@/lib/student/studentLearningPlanMapper";

describe("mapStudentLearningPlanRow", () => {
  it("zachowuje zgodność ze starszym payloadem lekcji", () => {
    const item = mapStudentLearningPlanRow({
      sessionId: "session-1",
      lessonId: "lesson-1",
      lessonVersion: 2,
      lessonTitle: "Wielokrotności",
      topicId: "M5-2.1",
      sectionId: "M5-S2",
      taughtAt: "2026-07-15T10:00:00Z",
      coveredExercises: ["1", "2a"],
    });

    expect(item).toMatchObject({
      sourceKind: "lesson",
      sessionId: "session-1",
      lessonId: "lesson-1",
      sectionId: "M5-S2",
      coveredExercises: ["1", "2a"],
      resultId: null,
      assignmentId: null,
    });
  });

  it("mapuje ukończony test do działu i wyniku", () => {
    const item = mapStudentLearningPlanRow({
      sourceKind: "assessment",
      sessionId: "",
      lessonId: "assessment:assignment-2",
      lessonTitle: "Sprawdzian — własności liczb",
      topicId: "M5-2.3",
      sectionId: "M5-S2",
      taughtAt: "2026-07-15T11:00:00Z",
      score: 8,
      maxScore: 10,
      completedAttempts: 2,
      resultId: "submission-7",
      assignmentId: "assignment-2",
    });

    expect(item).toMatchObject({
      sourceKind: "assessment",
      lessonVersion: 1,
      sectionId: "M5-S2",
      score: 8,
      maxScore: 10,
      resultId: "submission-7",
      assignmentId: "assignment-2",
      inProgressReviewId: null,
    });
  });
});
