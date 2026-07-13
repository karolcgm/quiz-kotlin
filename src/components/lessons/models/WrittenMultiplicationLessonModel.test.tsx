// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  FIRST_SLIDE_EXAMPLES,
  WrittenMultiplicationLessonModel,
  getWrittenMultiplicationLayout,
} from "@/components/lessons/models/WrittenMultiplicationLessonModel";

afterEach(cleanup);

describe("WrittenMultiplicationLessonModel", () => {
  it("odtwarza drabinkę z rysunku dla mnożnika jedno-, dwu- i trzycyfrowego", () => {
    const oneDigit = getWrittenMultiplicationLayout(2467, 8);
    const twoDigits = getWrittenMultiplicationLayout(2467, 68);
    const threeDigits = getWrittenMultiplicationLayout(2467, 688);

    expect(oneDigit.rows.map((row) => [row.digitCount, row.disabledRight, row.carryCount])).toEqual([[5, 0, 3]]);
    expect(twoDigits.rows.map((row) => [row.digitCount, row.disabledRight, row.carryCount])).toEqual([[6, 0, 3], [5, 1, 3]]);
    expect(threeDigits.rows.map((row) => [row.digitCount, row.disabledRight, row.carryCount])).toEqual([[7, 0, 3], [6, 1, 3], [5, 2, 3]]);
  });

  it("pokazuje tylko jedno z czterech zadań i przełącza je przyciskiem", () => {
    render(<WrittenMultiplicationLessonModel seed={1} />);

    expect(FIRST_SLIDE_EXAMPLES).toHaveLength(4);
    expect(screen.getAllByRole("article")).toHaveLength(1);
    expect(screen.getByRole("article", { name: "Zadanie 1: 782 razy 36" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Następne →" }));

    expect(screen.getAllByRole("article")).toHaveLength(1);
    expect(screen.getByRole("article", { name: "Zadanie 2: 47 razy 183" })).toBeInTheDocument();
    expect(screen.queryByRole("article", { name: "Zadanie 1: 782 razy 36" })).not.toBeInTheDocument();
  });

  it("wybiera zadanie zgodnie z numerem pytania i zamalowuje kratki przesunięcia", () => {
    const { container } = render(<WrittenMultiplicationLessonModel seed={1} questionNumber={3} questionCount={4} />);

    expect(screen.getByRole("article", { name: "Zadanie 3: 7 razy 4209" })).toBeInTheDocument();
    expect(screen.getByText("Zadanie 3/4")).toBeInTheDocument();
    expect(container.querySelectorAll("[data-disabled-cell='true']")).toHaveLength(6);
  });

  it("nie ocenia pięter ani przeniesień, tylko kompletny wynik na dole", () => {
    const reporter = vi.fn();
    render(<WrittenMultiplicationLessonModel seed={1} questionNumber={1} questionCount={4} onResultChange={reporter} />);
    reporter.mockClear();

    fireEvent.click(screen.getAllByRole("button", { name: /Iloczyn częściowy/ })[0]!);
    fireEvent.click(screen.getByRole("button", { name: "9" }));
    expect(reporter).not.toHaveBeenCalled();

    const resultCells = screen.getAllByRole("button", { name: /Wynik końcowy/ });
    "28152".split("").forEach((digit, index) => {
      fireEvent.click(resultCells[index]!);
      fireEvent.click(screen.getByRole("button", { name: digit }));
    });

    expect(reporter).toHaveBeenLastCalledWith(true, "28152");
    expect(screen.getByRole("status")).toHaveTextContent("Wynik końcowy jest poprawny.");
  });
});
