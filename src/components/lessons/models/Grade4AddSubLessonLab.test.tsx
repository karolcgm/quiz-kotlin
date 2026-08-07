/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Grade4AddSubLessonLab } from "@/components/lessons/models/Grade4AddSubLessonLab";

describe("Grade4AddSubLessonLab", () => {
  afterEach(cleanup);
  it("pokazuje pełne nazwy działań", () => {
    render(<Grade4AddSubLessonLab activity="language" />);
    for (const label of ["składnik", "suma", "odjemna", "odjemnik", "różnica"]) {
      expect(screen.getAllByText(label).length).toBeGreaterThan(0);
    }
  });

  it("blokuje klawiaturę urządzenia i używa klawiatury lekcyjnej", () => {
    render(<Grade4AddSubLessonLab activity="practice" questionNumber={1} questionCount={6} />);
    const input = screen.getByLabelText("Wynik działania");
    expect(input).toHaveAttribute("inputmode", "none");
    expect(input).toHaveAttribute("readonly");
    expect(screen.getByRole("region", { name: "Klawiatura do odpowiedzi" })).toBeInTheDocument();
  });

  it("nie zalicza pustego pola", () => {
    const onResultChange = vi.fn();
    render(<Grade4AddSubLessonLab activity="practice" questionNumber={1} questionCount={6} onResultChange={onResultChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Uzupełnij");
    expect(onResultChange).not.toHaveBeenCalledWith(false, expect.anything());
  });

  it("wymaga wyboru wygodnej pary i poprawnego wyniku", () => {
    const onResultChange = vi.fn();
    render(<Grade4AddSubLessonLab activity="smart-order" questionNumber={1} questionCount={4} onResultChange={onResultChange} />);
    fireEvent.click(screen.getByRole("button", { name: "8 + 2" }));
    const keypad = screen.getByRole("region", { name: "Klawiatura do odpowiedzi" });
    fireEvent.click(within(keypad).getByRole("button", { name: "2" }));
    fireEvent.click(within(keypad).getByRole("button", { name: "7" }));
    fireEvent.click(within(keypad).getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByRole("status")).toHaveTextContent("Brawo");
    expect(onResultChange).toHaveBeenLastCalledWith(true, "8 + 17 + 2 = 27");
  });
});
