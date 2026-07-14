// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SelfPacedLessonPlayer } from "@/components/student/SelfPacedLessonPlayer";
import type { StudentLessonReviewView } from "@/types/studentLearningPlan";

vi.mock("@/lib/actions/studentLearningPlan", () => ({
  submitStudentLessonReviewAnswerAction: vi.fn(),
  finishStudentLessonReviewAction: vi.fn(),
  resetStudentLessonReviewAction: vi.fn(),
}));

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const review: StudentLessonReviewView = {
  reviewId: "review-1", lessonId: "lesson-1", lessonVersion: 1, attemptNumber: 1,
  status: "in_progress", answers: {}, score: 0, maxScore: 1, currentStageIndex: 0,
  textbookPage: 42, coveredExercises: ["3", "4a"],
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
  it("pokazuje poziomą listę slajdów bez bocznego licznika", () => {
    render(<SelfPacedLessonPlayer initialReview={review} />);
    expect(screen.getAllByText("Podręcznik").length).toBeGreaterThan(0);
    expect(screen.getByText("Miejsce cyfry")).toBeInTheDocument();
    expect(screen.queryByText("Wynik tematu")).not.toBeInTheDocument();
    expect(screen.getByRole("navigation")).toHaveClass("grid-flow-col");
    expect(screen.getByRole("button", { name: "Dalej →" })).toBeInTheDocument();
  });

  it("pozwala uruchomić powtórkę na pełnym ekranie", () => {
    const requestFullscreen = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(HTMLElement.prototype, "requestFullscreen", { configurable: true, value: requestFullscreen });
    render(<SelfPacedLessonPlayer initialReview={review} />);
    screen.getByRole("button", { name: "⛶ Pełny ekran slajdu" }).click();
    expect(requestFullscreen).toHaveBeenCalledOnce();
  });

  it("keeps the written multiplication result after the model reports it", () => {
    const writtenReview: StudentLessonReviewView = {
      ...review,
      stageSnapshot: {
        ...review.stageSnapshot,
        stages: [{
          id: "written",
          kind: "practice",
          title: "Mnożenie pisemne",
          estimatedMinutes: 10,
          boardHeadline: "Oblicz",
          studentInstruction: "Wpisz wynik.",
          studentModelId: "written-multiplication-lesson",
          studentModelSeed: 1,
          questions: [{ questionInstanceId: "q-written", generatorId: "written-multiplication-v1", seed: 12, difficulty: "core", expression: "", prompt: "", maxScore: 1 }],
        }],
      },
    };

    render(<SelfPacedLessonPlayer initialReview={writtenReview} />);
    const resultCells = screen.getAllByRole("button", { name: /Wynik końcowy/ });
    "28152".split("").forEach((digit, index) => {
      fireEvent.click(resultCells[index]!);
      fireEvent.click(screen.getByRole("button", { name: digit }));
    });

    expect(resultCells.map((cell) => cell.textContent).join("")).toBe("28152");
    expect(screen.getByRole("button", { name: /Zapisz odpowiedź i dalej/ })).toBeEnabled();
  });

  it("shows narrative content and ungraded practice models in the student plan", () => {
    const practiceReview: StudentLessonReviewView = {
      ...review,
      maxScore: 0,
      stageSnapshot: {
        ...review.stageSnapshot,
        stages: [{
          id: "number-line",
          kind: "explore",
          title: "Rytmy na osi",
          estimatedMinutes: 10,
          boardHeadline: "Autobusy spotykają się na wspólnym przystanku",
          boardBody: "Wykonaj próbę na osi i opisz zauważony rytm.",
          boardBullets: ["Odjazd co 3 minuty — zaznacz kolejne punkty."],
          studentInstruction: "Odkryj rytm.",
          studentActivityMode: "practice",
          studentModelId: "number-line-jumps",
          studentModelSeed: 3,
          questions: [],
        }],
      },
    };

    render(<SelfPacedLessonPlayer initialReview={practiceReview} />);

    expect(screen.getByRole("img", { name: "Oś liczbowa" })).toBeInTheDocument();
    expect(screen.getByText("Autobusy spotykają się na wspólnym przystanku")).toBeInTheDocument();
    expect(screen.getByText("Odjazd co 3 minuty — zaznacz kolejne punkty.")).toBeInTheDocument();
  });
});
