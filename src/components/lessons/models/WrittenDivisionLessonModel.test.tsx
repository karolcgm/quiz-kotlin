// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  WRITTEN_DIVISION_EXAMPLES,
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

  it("pokazuje cztery poprawnie dobrane przykłady z dzieleniem dokładnym i z resztą", () => {
    render(<WrittenDivisionLessonModel seed={1} />);

    expect(WRITTEN_DIVISION_EXAMPLES).toHaveLength(4);
    expect(screen.getByRole("article", { name: "Zadanie 1: 864 podzielić przez 6" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Następne →" }));
    expect(screen.getByRole("article", { name: "Zadanie 2: 1728 podzielić przez 12" })).toBeInTheDocument();
  });

  it("ignoruje błędny brudnopis i ocenia wyłącznie końcowy iloraz", () => {
    const reporter = vi.fn();
    render(<WrittenDivisionLessonModel questionNumber={1} questionCount={4} onResultChange={reporter} />);
    reporter.mockClear();

    fireEvent.click(screen.getAllByRole("button", { name: /Iloczyn do odjęcia/ })[0]!);
    fireEvent.click(screen.getByRole("button", { name: "9" }));
    expect(reporter).not.toHaveBeenCalled();

    const quotientCells = screen.getAllByRole("button", { name: /Iloraz końcowy/ });
    "144".split("").forEach((digit, index) => {
      fireEvent.click(quotientCells[index]!);
      fireEvent.click(screen.getByRole("button", { name: digit }));
    });

    expect(reporter).toHaveBeenLastCalledWith(true, "144");
    expect(screen.getByRole("status")).toHaveTextContent("Końcowy iloraz i reszta są poprawne.");
  });

  it("w dzieleniu niecałkowitym sprawdza iloraz i końcową resztę", () => {
    const reporter = vi.fn();
    render(<WrittenDivisionLessonModel questionNumber={4} questionCount={4} onResultChange={reporter} />);
    reporter.mockClear();

    const quotientCells = screen.getAllByRole("button", { name: /Iloraz końcowy/ });
    "61".split("").forEach((digit, index) => {
      fireEvent.click(quotientCells[index]!);
      fireEvent.click(screen.getByRole("button", { name: digit }));
    });
    expect(reporter).toHaveBeenLastCalledWith(null, "61 r ");

    fireEvent.click(screen.getByRole("button", { name: "Reszta końcowa, cyfra 1" }));
    fireEvent.click(screen.getByRole("button", { name: "9" }));
    expect(reporter).toHaveBeenLastCalledWith(true, "61 r 9");
  });
});
