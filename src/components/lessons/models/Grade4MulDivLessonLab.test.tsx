/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Grade4MulDivLessonLab } from "@/components/lessons/models/Grade4MulDivLessonLab";

describe("Grade4MulDivLessonLab", () => {
  afterEach(cleanup);

  it("pokazuje nazwy oraz wyłącznie prosty przykład z tabliczki mnożenia", () => {
    render(<Grade4MulDivLessonLab activity="information" />);
    for (const label of ["czynnik", "iloczyn", "dzielna", "dzielnik", "iloraz"]) {
      expect(screen.getAllByText(label).length).toBeGreaterThan(0);
    }
    expect(screen.getByText("6 · 7 = 42")).toBeInTheDocument();
    expect(screen.getByText("42 : 6 = 7, bo 7 · 6 = 42")).toBeInTheDocument();
  });

  it("blokuje klawiaturę urządzenia i przyjmuje poprawny wynik", () => {
    const onResultChange = vi.fn();
    render(<Grade4MulDivLessonLab activity="practice" questionNumber={1} questionCount={8} onResultChange={onResultChange} />);
    const input = screen.getByLabelText("Wynik działania");
    expect(input).toHaveAttribute("inputmode", "none");
    expect(input).toHaveAttribute("readonly");

    const keypad = screen.getByRole("region", { name: "Klawiatura do odpowiedzi" });
    fireEvent.click(within(keypad).getByRole("button", { name: "5" }));
    fireEvent.click(within(keypad).getByRole("button", { name: "6" }));
    fireEvent.click(within(keypad).getByRole("button", { name: "Zatwierdź" }));

    expect(screen.getByRole("status")).toHaveTextContent("Brawo");
    expect(onResultChange).toHaveBeenLastCalledWith(true, "7 · 8 = 56");
  });

  it("korzysta tylko z przykładów wynikających z tabliczki mnożenia", () => {
    const { rerender } = render(<Grade4MulDivLessonLab activity="practice" questionNumber={2} questionCount={8} />);
    expect(screen.getByText("54 : 6 =")).toBeInTheDocument();
    rerender(<Grade4MulDivLessonLab activity="practice" questionNumber={6} questionCount={8} />);
    expect(screen.getByText("35 : 5 =")).toBeInTheDocument();
  });

  it("nie zalicza pustego pola", () => {
    const onResultChange = vi.fn();
    render(<Grade4MulDivLessonLab activity="product-quotient" questionNumber={2} questionCount={4} onResultChange={onResultChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Uzupełnij wynik");
    expect(onResultChange).not.toHaveBeenCalledWith(false, expect.anything());
  });
});
