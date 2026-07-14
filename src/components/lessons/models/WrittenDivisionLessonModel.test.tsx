// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  WRITTEN_DIVISION_EXAMPLES,
  WRITTEN_DIVISION_REMAINDER_EXAMPLES,
  WrittenDivisionLessonModel,
  getWrittenDivisionLayout,
} from "@/components/lessons/models/WrittenDivisionLessonModel";

afterEach(cleanup);

describe("WrittenDivisionLessonModel", () => {
  it("buduje kroki dzielenia i zachowuje obowiązkowe zero w ilorazie", () => {
    const layout = getWrittenDivisionLayout(7392, 24);

    expect(layout.quotient).toBe(308);
    expect(layout.remainder).toBe(0);
    expect(layout.steps.map((step) => step.partialDividend)).toEqual([73, 19, 192]);
    expect(layout.steps.map((step) => step.quotientDigit)).toEqual([3, 0, 8]);
    expect(layout.steps.map((step) => step.product)).toEqual([72, 0, 192]);
  });

  it("ma sześć przykładów bez reszty oraz sześć różnych zadań tekstowych z resztą", () => {
    expect(WRITTEN_DIVISION_EXAMPLES).toHaveLength(6);
    expect(WRITTEN_DIVISION_EXAMPLES.every((task) => task.dividend % task.divisor === 0)).toBe(true);
    expect(WRITTEN_DIVISION_REMAINDER_EXAMPLES).toHaveLength(6);
    expect(new Set(WRITTEN_DIVISION_REMAINDER_EXAMPLES.map((task) => task.title))).toHaveLength(6);
    expect(WRITTEN_DIVISION_REMAINDER_EXAMPLES.every((task) => {
      const remainder = task.dividend % task.divisor;
      return task.story.length > 80 && remainder > 0 && remainder < task.divisor;
    })).toBe(true);
  });

  it("otwiera slajd dzielenia z resztą od pierwszej historii", () => {
    render(<WrittenDivisionLessonModel seed={2} />);

    expect(screen.getByRole("article", { name: "Zadanie 1: 53 podzielić przez 8" })).toBeInTheDocument();
    expect(screen.getByText(/Chrupek ma 53 flamastry/)).toBeInTheDocument();
  });

  it("układa dzielną, znak dzielenia i dzielnik w jednym wierszu oraz pozostawia odpowiedzi puste", () => {
    const { container } = render(<WrittenDivisionLessonModel seed={1} questionNumber={1} questionCount={6} />);

    expect(screen.getByRole("article", { name: "Zadanie 1: 180 podzielić przez 5" })).toBeInTheDocument();
    expect(Array.from(container.querySelectorAll("[data-fixed-cell]")).map((cell) => cell.textContent).join("")).toBe("180:5");
    expect(Array.from(container.querySelectorAll("[data-answer-cell]")).every((cell) => cell.textContent === "")).toBe(true);
    expect(screen.getByRole("button", { name: "Reszta końcowa, cyfra 1" })).toHaveTextContent("");
  });

  it("przy zerze na końcu ilorazu nie powiela ostatniej reszty", () => {
    render(<WrittenDivisionLessonModel seed={1} questionNumber={5} questionCount={6} />);

    expect(screen.getByRole("article", { name: "Zadanie 5: 960 podzielić przez 6" })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /Iloraz końcowy/ })).toHaveLength(3);
    expect(screen.getByRole("button", { name: "Reszta końcowa, cyfra 1" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Liczba po sprowadzeniu, krok 2, cyfra 1" })).not.toBeInTheDocument();
  });

  it("ignoruje błędne pola robocze i ocenia tylko iloraz oraz ostatnią resztę", () => {
    const reporter = vi.fn();
    render(<WrittenDivisionLessonModel seed={1} questionNumber={1} questionCount={6} onResultChange={reporter} />);
    reporter.mockClear();

    fireEvent.click(screen.getAllByRole("button", { name: /Iloczyn do odjęcia/ })[0]!);
    fireEvent.click(screen.getByRole("button", { name: "9" }));
    expect(reporter).not.toHaveBeenCalled();

    const quotientCells = screen.getAllByRole("button", { name: /Iloraz końcowy/ });
    "36".split("").forEach((digit, index) => {
      fireEvent.click(quotientCells[index]!);
      fireEvent.click(screen.getByRole("button", { name: digit }));
    });
    expect(reporter).toHaveBeenLastCalledWith(null, "36");

    fireEvent.click(screen.getByRole("button", { name: "Reszta końcowa, cyfra 1" }));
    fireEvent.click(screen.getByRole("button", { name: "0" }));
    expect(reporter).toHaveBeenLastCalledWith(true, "36");
    expect(screen.getByRole("status")).toHaveTextContent("Końcowy iloraz i reszta są poprawne.");
  });

  it("w zadaniu tekstowym sprawdza iloraz i niezerową resztę", () => {
    const reporter = vi.fn();
    render(<WrittenDivisionLessonModel seed={2} questionNumber={1} questionCount={6} onResultChange={reporter} />);
    reporter.mockClear();

    expect(screen.getByText(/Chrupek ma 53 flamastry/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Iloraz końcowy, cyfra 1" }));
    fireEvent.click(screen.getByRole("button", { name: "6" }));
    expect(reporter).toHaveBeenLastCalledWith(null, "6 r ");

    fireEvent.click(screen.getByRole("button", { name: "Reszta końcowa, cyfra 1" }));
    fireEvent.click(screen.getByRole("button", { name: "5" }));
    expect(reporter).toHaveBeenLastCalledWith(true, "6 r 5");
  });
});
