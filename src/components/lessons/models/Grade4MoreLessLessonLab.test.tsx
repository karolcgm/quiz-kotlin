/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Grade4MoreLessLessonLab } from "@/components/lessons/models/Grade4MoreLessLessonLab";

describe("Grade4MoreLessLessonLab", () => {
  afterEach(cleanup);

  it("pokazuje oba znaczenia na slajdzie informacyjnym", () => {
    render(<Grade4MoreLessLessonLab activity="information" />);
    expect(screen.getByText("22 + 5 = 27")).toBeInTheDocument();
    expect(screen.getByText("22 − 7 = 15")).toBeInTheDocument();
    expect(screen.getByText(/O więcej.*dodajemy/)).toBeInTheDocument();
    expect(screen.getByText(/O mniej.*odejmujemy/)).toBeInTheDocument();
  });

  it("blokuje klawiaturę urządzenia i przyjmuje wynik pierwszego zadania", () => {
    const onResultChange = vi.fn();
    render(<Grade4MoreLessLessonLab activity="practice" questionNumber={1} questionCount={6} onResultChange={onResultChange} />);

    expect(screen.getByText("Znajdź liczbę o 9 większą od 35.")).toBeInTheDocument();
    const input = screen.getByLabelText("Wynik");
    expect(input).toHaveAttribute("inputmode", "none");
    expect(input).toHaveAttribute("readonly");

    const keypad = screen.getByRole("region", { name: "Klawiatura do odpowiedzi" });
    fireEvent.click(within(keypad).getByRole("button", { name: "4" }));
    fireEvent.click(within(keypad).getByRole("button", { name: "4" }));
    fireEvent.click(within(keypad).getByRole("button", { name: "Zatwierdź" }));

    expect(screen.getByRole("status")).toHaveTextContent("Brawo");
    expect(onResultChange).toHaveBeenLastCalledWith(true, "44");
  });

  it("zawiera zadanie zapisane w drugą stronę", () => {
    render(<Grade4MoreLessLessonLab activity="reverse" questionNumber={1} questionCount={4} />);
    const input = screen.getByLabelText("Wynik");
    const label = input.closest("label");
    expect(label).toHaveTextContent("to o 8 więcej niż 34.");
    expect(label?.firstElementChild).toBe(input);
  });

  it("pokazuje osobną grafikę i wymaga obu odpowiedzi a) oraz b)", () => {
    const onResultChange = vi.fn();
    render(<Grade4MoreLessLessonLab activity="stories" questionNumber={1} questionCount={4} onResultChange={onResultChange} />);

    expect(screen.getByAltText("Dwoje dzieci układa książki na dwóch półkach")).toBeInTheDocument();
    const first = screen.getByLabelText("Odpowiedź a: liczba książek na górnej półce");
    const second = screen.getByLabelText("Odpowiedź b: liczba książek na obu półkach");
    for (const input of [first, second]) {
      expect(input).toHaveAttribute("inputmode", "none");
      expect(input).toHaveAttribute("readonly");
    }

    const keypad = screen.getByRole("region", { name: "Klawiatura do odpowiedzi" });
    fireEvent.click(first);
    fireEvent.click(within(keypad).getByRole("button", { name: "3" }));
    fireEvent.click(within(keypad).getByRole("button", { name: "1" }));
    fireEvent.click(second);
    fireEvent.click(within(keypad).getByRole("button", { name: "5" }));
    fireEvent.click(within(keypad).getByRole("button", { name: "5" }));
    fireEvent.click(within(keypad).getByRole("button", { name: "Zatwierdź" }));

    expect(screen.getByRole("status")).toHaveTextContent("Brawo");
    expect(onResultChange).toHaveBeenLastCalledWith(true, "31, 55");
  });

  it("nie zalicza zadania tekstowego z pustym podpunktem", () => {
    const onResultChange = vi.fn();
    render(<Grade4MoreLessLessonLab activity="stories" questionNumber={1} questionCount={4} onResultChange={onResultChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Uzupełnij wszystkie wymagane pola");
    expect(onResultChange).not.toHaveBeenCalledWith(false, expect.anything());
  });
});
