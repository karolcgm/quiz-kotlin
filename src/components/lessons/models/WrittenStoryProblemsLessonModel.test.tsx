// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  STORY_PROBLEMS,
  WrittenStoryProblemsLessonModel,
} from "@/components/lessons/models/WrittenStoryProblemsLessonModel";

afterEach(cleanup);

function completeWrittenResult(result: string) {
  const writtenSection = screen
    .getByText("Obliczenia pisemne — uzupełnij kratki")
    .closest("section");
  if (!writtenSection) throw new Error("Brak sekcji obliczeń pisemnych.");
  const grid = within(writtenSection);
  const resultCells = grid.getAllByRole("button", {
    name: /Wynik, kolumna/,
  });

  result.split("").forEach((digit, index) => {
    fireEvent.click(resultCells[index]!);
    fireEvent.click(grid.getByRole("button", { name: digit }));
  });
}

describe("WrittenStoryProblemsLessonModel", () => {
  it("pierwsze zadanie jest jednoetapowe i wymaga dodawania pisemnego", () => {
    expect(STORY_PROBLEMS[0].writtenOperation).toEqual({
      a: 3486,
      b: 2759,
      subtract: false,
    });
    expect(STORY_PROBLEMS[0].modelPlan).toBe("3486 + 2759 = 6245.");

    render(<WrittenStoryProblemsLessonModel seed={1} />);

    expect(
      screen.queryByText(/Zaplanuj dwa działania/),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText("Obliczenia pisemne — uzupełnij kratki"),
    ).toBeInTheDocument();
  });

  it("zgłasza poprawne dodawanie pisemne i pełną odpowiedź", () => {
    const reporter = vi.fn();
    render(
      <WrittenStoryProblemsLessonModel seed={1} onResultChange={reporter} />,
    );
    reporter.mockClear();

    completeWrittenResult("6245");
    fireEvent.change(screen.getByLabelText("Wynik zadania tekstowego"), {
      target: { value: "6245" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Sprawdź rozwiązanie" }),
    );

    expect(reporter).toHaveBeenLastCalledWith(
      true,
      "3486 + 2759 = 6245 | 6245",
    );
    expect(screen.getAllByRole("status").at(-1)).toHaveTextContent(
      "Rozwiązanie jest poprawne",
    );
  });

  it("w drugim zadaniu wymaga danych potrzebnych do odejmowania pisemnego", () => {
    const reporter = vi.fn();
    render(
      <WrittenStoryProblemsLessonModel seed={2} onResultChange={reporter} />,
    );
    reporter.mockClear();

    fireEvent.click(
      screen.getByRole("button", { name: "7250 przygotowanych biletów" }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "3687 sprzedanych biletów" }),
    );
    completeWrittenResult("3563");
    fireEvent.change(screen.getByLabelText("Wynik zadania tekstowego"), {
      target: { value: "3563" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Sprawdź rozwiązanie" }),
    );

    expect(reporter).toHaveBeenLastCalledWith(
      true,
      "7250 − 3687 = 3563 | 3563",
    );
  });
});
