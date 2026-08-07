/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Grade4TimesTenLessonLab } from "@/components/lessons/models/Grade4TimesTenLessonLab";

describe("Grade4TimesTenLessonLab", () => {
  afterEach(cleanup);

  it("wyróżnia wszystkie zera i przekreśla je w przykładach dzielenia", () => {
    const { container } = render(<Grade4TimesTenLessonLab activity="information" />);
    expect(container.querySelectorAll("[data-red-zero]").length).toBeGreaterThan(0);
    expect(container.querySelectorAll('[data-cancelled-zero="true"]')).toHaveLength(12);
    expect(screen.getByText("Skreślamy jedną parę zer.")).toBeInTheDocument();
    expect(screen.getByText("Skreślamy dwie pary zer.")).toBeInTheDocument();
    expect(screen.getByText("Skreślamy trzy pary zer.")).toBeInTheDocument();
  });

  it("blokuje klawiaturę urządzenia i przyjmuje poprawny wynik mnożenia", () => {
    const onResultChange = vi.fn();
    render(<Grade4TimesTenLessonLab activity="multiply" questionNumber={1} questionCount={6} onResultChange={onResultChange} />);
    const input = screen.getByLabelText("Wynik działania");
    expect(input).toHaveAttribute("inputmode", "none");
    expect(input).toHaveAttribute("readonly");

    const keypad = screen.getByRole("region", { name: "Klawiatura do odpowiedzi" });
    fireEvent.click(within(keypad).getByRole("button", { name: "6" }));
    fireEvent.click(within(keypad).getByRole("button", { name: "0" }));
    fireEvent.click(within(keypad).getByRole("button", { name: "Zatwierdź" }));

    expect(screen.getByRole("status")).toHaveTextContent("Brawo");
    expect(onResultChange).toHaveBeenLastCalledWith(true, "6 · 10 = 60");
  });

  it("podaje wspierającą informację po niepoprawnym dzieleniu", () => {
    render(<Grade4TimesTenLessonLab activity="divide" questionNumber={1} questionCount={6} />);
    const keypad = screen.getByRole("region", { name: "Klawiatura do odpowiedzi" });
    fireEvent.click(within(keypad).getByRole("button", { name: "8" }));
    fireEvent.click(within(keypad).getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByRole("status")).toHaveTextContent("Spróbuj innym razem. Poprawny wynik to 9. Dziś bez punktu.");
  });

  it("nie zalicza pustego pola", () => {
    const onResultChange = vi.fn();
    render(<Grade4TimesTenLessonLab activity="mixed" questionNumber={1} questionCount={6} onResultChange={onResultChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Uzupełnij wynik");
    expect(onResultChange).not.toHaveBeenCalledWith(false, expect.anything());
  });
});
