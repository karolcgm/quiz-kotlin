/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BoardStageDisplay } from "@/components/live/BoardStageDisplay";
import { StudentSessionClient } from "@/components/live/StudentSessionClient";
import { SelfPacedLessonPlayer } from "@/components/student/SelfPacedLessonPlayer";
import { m681ZapisywanieWyrazenV1 } from "@/data/lessons/m6-8-wyrazenia-i-rownania";
import { buildLessonSessionSnapshot } from "@/lib/lessons/buildSessionSnapshot";
import { generateAlgebraTask } from "@/lib/math/algebra/grade6Algebra";
import type { LessonSessionStudentView } from "@/types/lessonSession";
import type { StudentLessonReviewView } from "@/types/studentLearningPlan";

vi.mock("@react-three/fiber", () => ({ Canvas: () => <div data-r3f-canvas />, useFrame: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }));
vi.mock("@/lib/actions/lessonSessions", () => ({
  submitLessonStageResponseAction: vi.fn(),
  submitLiveLessonUnderstandingAction: vi.fn(),
  updateLessonSessionHelpAction: vi.fn(),
}));
vi.mock("@/lib/actions/studentLearningPlan", () => ({
  submitStudentLessonReviewAnswerAction: vi.fn(),
  finishStudentLessonReviewAction: vi.fn(),
  resetStudentLessonReviewAction: vi.fn(),
}));
vi.mock("@/lib/live/useStudentSessionSync", () => ({
  useStudentSessionSync: (_sessionId: string, initialView: LessonSessionStudentView) => ({ view: initialView, connection: "live", refresh: vi.fn() }),
}));

beforeEach(() => {
  Object.defineProperty(window, "matchMedia", { configurable: true, value: vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }) });
});
afterEach(cleanup);

function translationStage() {
  const stages = buildLessonSessionSnapshot(m681ZapisywanieWyrazenV1).stageSnapshot.stages;
  const stage = stages.find((item) => item.id.includes("translate"));
  if (!stage) throw new Error("Brak slajdu tłumaczenia wyrażeń.");
  return { stage, stages };
}

describe("Dział 8 — kanały tablicy i ucznia live", () => {
  it("na tablicy używa zewnętrznych przycisków poprzedni/następny i jednego licznika w karcie", () => {
    const { stage, stages } = translationStage();
    render(<BoardStageDisplay stage={stage} stageIndex={3} stageCount={stages.length} solutionRevealed={false} />);
    expect(screen.getAllByText("Zadanie 1/16")).toHaveLength(1);
    expect(screen.getByRole("combobox", { name: "Wybierz zadanie" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "← Poprzednie" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Następne →" }));
    expect(screen.getAllByText("Zadanie 2/16")).toHaveLength(1);
    expect(screen.getByRole("button", { name: "← Poprzednie" })).not.toBeDisabled();
  });

  it("uczeń live dostaje ten sam model, a odpowiedź bez punktu odblokowuje wymagany przycisk", async () => {
    const { stage, stages } = translationStage();
    const view: LessonSessionStudentView = {
      sessionId: "algebra-session",
      status: "live",
      paceMode: "teacher",
      boardOnlyMode: false,
      activeStageIndex: 3,
      stageCount: stages.length,
      sequenceNumber: 1,
      lessonTitle: m681ZapisywanieWyrazenV1.title,
      topicId: m681ZapisywanieWyrazenV1.topicId,
      activeStage: stage,
      helpStatus: "none",
      myResponses: [],
    };
    render(<StudentSessionClient sessionId="algebra-session" initialView={view} />);
    expect(screen.getAllByText("Zadanie 1/16")).toHaveLength(1);
    const taskNavigation = screen.getByRole("navigation", { name: "Zadania na slajdzie" });
    fireEvent.click(within(taskNavigation).getByRole("button", { name: "2" }));
    expect(screen.getAllByText("Zadanie 2/16")).toHaveLength(1);
    fireEvent.click(within(taskNavigation).getByRole("button", { name: "1" }));
    expect(screen.getByRole("button", { name: "Najpierw sprawdź rozwiązanie" })).toBeDisabled();

    const publicQuestion = stage.questions[0]!;
    const task = generateAlgebraTask("translate-words", publicQuestion.seed);
    if (!task || task.kind !== "choice") throw new Error("Oczekiwano zadania wyboru.");
    const wrong = task.options.find((option) => option !== task.answer)!;
    fireEvent.click(screen.getByRole("button", { name: wrong }));
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź odpowiedź" }));
    await waitFor(() => expect(screen.getAllByText(/Spróbuj innym razem.*Dziś bez punktu/u)).toHaveLength(1));
    expect(screen.getByRole("button", { name: "Przejdź dalej bez punktu" })).not.toBeDisabled();
  });

  it("w pracy własnej zachowuje ten sam slajd, licznik i przejście bez punktu", () => {
    const { stage, stages } = translationStage();
    const stageIndex = stages.indexOf(stage);
    const review: StudentLessonReviewView = {
      reviewId: "algebra-review",
      lessonId: m681ZapisywanieWyrazenV1.id,
      lessonVersion: 1,
      attemptNumber: 1,
      status: "in_progress",
      answers: {},
      score: 0,
      maxScore: stages.flatMap((item) => item.questions).length,
      currentStageIndex: stageIndex,
      textbookPage: null,
      coveredExercises: [],
      stageSnapshot: buildLessonSessionSnapshot(m681ZapisywanieWyrazenV1).stageSnapshot,
    };
    render(<SelfPacedLessonPlayer initialReview={review} />);
    expect(screen.getAllByText("Zadanie 1/16")).toHaveLength(1);
    expect(screen.getByRole("button", { name: "Najpierw wykonaj zadanie" })).toBeDisabled();
    const task = generateAlgebraTask("translate-words", stage.questions[0]!.seed + 100003);
    if (!task || task.kind !== "choice") throw new Error("Oczekiwano zadania wyboru.");
    const wrong = task.options.find((option) => option !== task.answer)!;
    fireEvent.click(screen.getByRole("button", { name: wrong }));
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź odpowiedź" }));
    expect(screen.getByRole("button", { name: "Przejdź dalej bez punktu" })).not.toBeDisabled();
  });
});
