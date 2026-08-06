/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { StudentLessonModelActivity } from "@/components/live/StudentLessonModelActivity";
import type { LessonSessionStageQuestion } from "@/types/lessonSession";

vi.mock("@/lib/actions/lessonSessions", () => ({ submitLessonStageResponseAction: vi.fn() }));

afterEach(cleanup);

const question: LessonSessionStageQuestion = {
  questionInstanceId: "q-1",
  generatorId: "interactive-lesson-series-v1",
  seed: 1,
  difficulty: "core",
  expression: "",
  prompt: "",
  maxScore: 1,
};

describe("StudentLessonModelActivity — wspólna informacja zwrotna klasy VI", () => {
  it("dodaje neutralny komunikat i przejście bez punktu, gdy model nie ma własnego komunikatu", () => {
    render(<StudentLessonModelActivity sessionId="session" stageId="m6-9-1-task" question={question} questionNumber={1} questionCount={1} onRefresh={vi.fn()}>{(onResultChange) => <button type="button" onClick={() => onResultChange(false, "odpowiedź")}>Sprawdź</button>}</StudentLessonModelActivity>);
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź" }));
    expect(screen.getByRole("status")).toHaveTextContent("Spróbuj innym razem. Poprawny wynik to ten pokazany w informacji zwrotnej powyżej. Dziś bez punktu.");
    expect(screen.getByRole("button", { name: "Przejdź dalej bez punktu" })).toBeEnabled();
  });

  it("dodaje pozytywny komentarz po poprawnym ukończeniu", () => {
    render(<StudentLessonModelActivity sessionId="session" stageId="m6-9-1-task" question={question} questionNumber={1} questionCount={1} onRefresh={vi.fn()}>{(onResultChange) => <button type="button" onClick={() => onResultChange(true, "odpowiedź")}>Sprawdź</button>}</StudentLessonModelActivity>);
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź" }));
    expect(screen.getByRole("status")).toHaveTextContent("Brawo! Odpowiedź jest poprawna.");
  });
});
