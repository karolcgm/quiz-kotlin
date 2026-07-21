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

  it("uruchamia oceniane zadanie geometryczne zamiast planszy zastępczej", () => {
    const geometryReview: StudentLessonReviewView = {
      ...review,
      stageSnapshot: {
        ...review.stageSnapshot,
        sectionId: "M5-S4",
        topicId: "M5-4.7",
        title: "Konstrukcja trójkąta o danych bokach",
        stages: [{
          id: "m547-evidence",
          kind: "practice",
          title: "Ćwiczenia — 5 przykładów",
          estimatedMinutes: 14,
          boardHeadline: "Jedno aktywne zadanie geometryczne",
          studentInstruction: "Rozwiąż jedno zadanie.",
          studentModelId: "geometry-lab",
          studentModelSeed: 470601,
          questions: [{ questionInstanceId: "q-geometry", generatorId: "geometry-triangle-construction-v1", seed: 470201, difficulty: "support", expression: "", prompt: "", maxScore: 1 }],
        }],
      },
    };

    const { container } = render(<SelfPacedLessonPlayer initialReview={geometryReview} />);
    expect(container.querySelector("[data-triangle-construction-lab][data-activity='inequality']")).toBeInTheDocument();
    expect(screen.queryByText("Ten slajd służy do samodzielnego obejrzenia.")).not.toBeInTheDocument();
  });

  it("uruchamia interaktywną kratownicę pola zamiast pustej planszy", () => {
    const areaReview: StudentLessonReviewView = {
      ...review,
      maxScore: 0,
      stageSnapshot: {
        ...review.stageSnapshot,
        sectionId: "M5-S6",
        topicId: "M5-6.1",
        title: "Pole prostokąta i kwadratu",
        stages: [{
          id: "m5-6-1-pokryj-bez-luk-v1-s2",
          kind: "explore",
          title: "Pole na kratownicy",
          estimatedMinutes: 8,
          boardHeadline: "Zmieniaj wymiary prostokąta",
          studentInstruction: "Ustaw długość i szerokość.",
          studentModelId: "rectangle-square-area-lab",
          questions: [],
        }],
      },
    };

    const { container } = render(<SelfPacedLessonPlayer initialReview={areaReview} />);

    expect(screen.getAllByText("Pole na kratownicy").length).toBeGreaterThan(0);
    expect(container.querySelectorAll("input[type='range']")).toHaveLength(2);
    expect(container.querySelectorAll("[data-area-cell='active']")).toHaveLength(24);
  });

  it("uruchamia serię zamiany jednostek zamiast pustej planszy", () => {
    const conversionReview: StudentLessonReviewView = {
      ...review,
      maxScore: 0,
      stageSnapshot: {
        ...review.stageSnapshot,
        sectionId: "M5-S6",
        topicId: "M5-6.2",
        title: "Zależności między jednostkami",
        stages: [{
          id: "m5-6-2-powiekszenie-kwadratu-v1-s3",
          kind: "practice",
          title: "Zamiana jednostek długości",
          estimatedMinutes: 12,
          boardHeadline: "Zamiana jednostek długości",
          studentInstruction: "Zamieniaj jednostki.",
          studentModelId: "area-unit-conversion-lab",
          questions: [],
        }],
      },
    };

    render(<SelfPacedLessonPlayer initialReview={conversionReview} />);

    expect(screen.getByText("Zadanie 1/10")).toBeInTheDocument();
    expect(screen.getByLabelText("3 m równa się ile cm")).toBeInTheDocument();
    expect(screen.getByLabelText("Kalkulator do zamiany jednostek")).toBeInTheDocument();
  });
});
