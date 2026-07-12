// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SelfPacedLessonPlayer } from "@/components/student/SelfPacedLessonPlayer";
import type { StudentLessonReviewView } from "@/types/studentLearningPlan";

vi.mock("@/lib/actions/studentLearningPlan", () => ({
  submitStudentLessonReviewAnswerAction: vi.fn(),
  finishStudentLessonReviewAction: vi.fn(),
}));

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const review: StudentLessonReviewView = {
  reviewId: "review-1", lessonId: "lesson-1", lessonVersion: 1, attemptNumber: 1,
  status: "in_progress", answers: {}, score: 0, maxScore: 1, currentStageIndex: 0,
  stageSnapshot: {
    lessonId: "lesson-1", lessonVersion: 1, curriculumId: "curriculum", sectionId: "M5-S1",
    skillIds: ["skill"], title: "Zapisywanie liczb", topicId: "M5-1.1", studentGoal: "Ćwiczę",
    stages: [
      { id: "book", kind: "warmup", title: "Podręcznik", estimatedMinutes: 5, boardHeadline: "Strona", modelId: "exercise-board", modelSeed: 1, questions: [] },
      { id: "task", kind: "practice", title: "Miejsce cyfry", estimatedMinutes: 5, boardHeadline: "Zadanie", studentInstruction: "Odpowiedz", studentModelId: "natural-numbers-lesson", studentModelSeed: 1, questions: [{ questionInstanceId: "q1", generatorId: "natural-numbers-v1", seed: 12, difficulty: "core", expression: "", prompt: "", maxScore: 1 }] },
    ],
  },
};

describe("SelfPacedLessonPlayer", () => {
  it("pokazuje boczną listę slajdów i licznik punktów", () => {
    render(<SelfPacedLessonPlayer initialReview={review} />);
    expect(screen.getAllByText("Podręcznik").length).toBeGreaterThan(0);
    expect(screen.getByText("Miejsce cyfry")).toBeInTheDocument();
    expect(screen.getByText("Wynik tematu")).toBeInTheDocument();
    expect(screen.getByText("/1")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Dalej →" })).toBeInTheDocument();
  });

  it("pozwala uruchomić powtórkę na pełnym ekranie", () => {
    const requestFullscreen = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(HTMLElement.prototype, "requestFullscreen", { configurable: true, value: requestFullscreen });
    render(<SelfPacedLessonPlayer initialReview={review} />);
    screen.getByRole("button", { name: "⛶ Pełny ekran slajdu" }).click();
    expect(requestFullscreen).toHaveBeenCalledOnce();
  });
});
