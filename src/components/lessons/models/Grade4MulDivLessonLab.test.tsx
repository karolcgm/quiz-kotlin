/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Grade4MulDivLessonLab } from "@/components/lessons/models/Grade4MulDivLessonLab";

describe("Grade4MulDivLessonLab", () => {
  afterEach(cleanup);

  it("pokazuje pełne nazwy mnożenia i dzielenia", () => {
    render(<Grade4MulDivLessonLab activity="language" />);
    for (const label of ["czynnik", "iloczyn", "dzielna", "dzielnik", "iloraz"]) {
      expect(screen.getAllByText(label).length).toBeGreaterThan(0);
    }
  });

  it("pokazuje rachunek przez rozbijanie liczby", () => {
    render(<Grade4MulDivLessonLab activity="split-multiply" />);
    expect(screen.getByText("6 · 14 = 84")).toBeInTheDocument();
    expect(screen.getByText("6 · 10 + 6 · 4")).toBeInTheDocument();
  });

  it("blokuje klawiaturę urządzenia i przyjmuje poprawny iloczyn", () => {
    const onResultChange = vi.fn();
    render(<Grade4MulDivLessonLab activity="practice" questionNumber={1} questionCount={6} onResultChange={onResultChange} />);
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

  it("w rachunku sprytnym wymaga dogodnej pary i wyniku", () => {
    const onResultChange = vi.fn();
    render(<Grade4MulDivLessonLab activity="smart-order" questionNumber={1} questionCount={4} onResultChange={onResultChange} />);
    fireEvent.click(screen.getByRole("button", { name: "2 · 5" }));
    const keypad = screen.getByRole("region", { name: "Klawiatura do odpowiedzi" });
    fireEvent.click(within(keypad).getByRole("button", { name: "9" }));
    fireEvent.click(within(keypad).getByRole("button", { name: "0" }));
    fireEvent.click(within(keypad).getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByRole("status")).toHaveTextContent("Brawo");
    expect(onResultChange).toHaveBeenLastCalledWith(true, "2 · 9 · 5 = 90");
  });

  it("nie zalicza pustego pola", () => {
    const onResultChange = vi.fn();
    render(<Grade4MulDivLessonLab activity="product-quotient" questionNumber={2} questionCount={4} onResultChange={onResultChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Uzupełnij wszystkie wymagane pola");
    expect(onResultChange).not.toHaveBeenCalledWith(false, expect.anything());
  });
});
