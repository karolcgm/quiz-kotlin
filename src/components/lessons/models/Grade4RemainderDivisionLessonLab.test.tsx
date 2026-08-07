/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Grade4RemainderDivisionLessonLab } from "@/components/lessons/models/Grade4RemainderDivisionLessonLab";

function press(keypad: HTMLElement, ...keys: string[]) {
  for (const key of keys) fireEvent.click(within(keypad).getByRole("button", { name: key }));
}

describe("Grade4RemainderDivisionLessonLab", () => {
  afterEach(cleanup);

  it("wyjaśnia dzielenie 20 cukierków i pokazuje sprawdzenie", () => {
    render(<Grade4RemainderDivisionLessonLab activity="information" />);
    expect(screen.getByText("20 : 3 = 6 r 2")).toBeInTheDocument();
    expect(screen.getByText("3 · 6 + 2 = 20")).toBeInTheDocument();
    expect(screen.getByText(/Reszta zawsze jest mniejsza od dzielnika/)).toBeInTheDocument();
    expect(screen.getAllByText("6 cukierków")).toHaveLength(3);
  });

  it("blokuje klawiaturę urządzenia i wymaga pełnego sprawdzenia", () => {
    const onResultChange = vi.fn();
    render(<Grade4RemainderDivisionLessonLab activity="practice" questionNumber={1} questionCount={8} onResultChange={onResultChange} />);

    const quotient = screen.getByLabelText("Iloraz");
    const remainder = screen.getByLabelText("Reszta");
    const verification = screen.getByLabelText("Wynik sprawdzenia");
    for (const input of [quotient, remainder, verification]) {
      expect(input).toHaveAttribute("inputmode", "none");
      expect(input).toHaveAttribute("readonly");
    }

    const keypad = screen.getByRole("region", { name: "Klawiatura do dzielenia z resztą" });
    press(keypad, "3");
    fireEvent.click(remainder);
    press(keypad, "2", "Zatwierdź");
    expect(screen.getByRole("alert")).toHaveTextContent("Uzupełnij iloraz, resztę i wynik sprawdzenia.");
    expect(onResultChange).not.toHaveBeenCalledWith(true, expect.anything());
  });

  it("zalicza dzielenie dopiero po poprawnym sprawdzeniu", () => {
    const onResultChange = vi.fn();
    render(<Grade4RemainderDivisionLessonLab activity="practice" questionNumber={1} questionCount={8} onResultChange={onResultChange} />);
    const keypad = screen.getByRole("region", { name: "Klawiatura do dzielenia z resztą" });
    press(keypad, "3");
    fireEvent.click(screen.getByLabelText("Reszta"));
    press(keypad, "2");
    fireEvent.click(screen.getByLabelText("Wynik sprawdzenia"));
    press(keypad, "1", "7", "Zatwierdź");

    expect(screen.getByRole("status")).toHaveTextContent("Brawo! Dzielenie i sprawdzenie są poprawne.");
    expect(onResultChange).toHaveBeenLastCalledWith(true, "17:5=3r2; 5*3+2=17");
  });

  it("po niepoprawnej odpowiedzi podaje wynik i całe sprawdzenie", () => {
    render(<Grade4RemainderDivisionLessonLab activity="practice" questionNumber={2} questionCount={8} />);
    const keypad = screen.getByRole("region", { name: "Klawiatura do dzielenia z resztą" });
    press(keypad, "1");
    fireEvent.click(screen.getByLabelText("Reszta"));
    press(keypad, "1");
    fireEvent.click(screen.getByLabelText("Wynik sprawdzenia"));
    press(keypad, "1", "Zatwierdź");

    expect(screen.getByRole("status")).toHaveTextContent("Spróbuj innym razem. Poprawny wynik to 26 : 4 = 6 r 2, a sprawdzenie: 4 · 6 + 2 = 26. Dziś bez punktu.");
  });

  it("rozpoznaje wszystkie możliwe reszty przy dzieleniu przez 6", () => {
    const onResultChange = vi.fn();
    render(<Grade4RemainderDivisionLessonLab activity="remainders" questionNumber={1} questionCount={5} onResultChange={onResultChange} />);
    for (const value of ["0", "1", "2", "3", "4", "5"]) fireEvent.click(screen.getByRole("button", { name: value }));
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź odpowiedź" }));

    expect(screen.getByRole("status")).toHaveTextContent("Reszta może wynosić od 0 do 5.");
    expect(onResultChange).toHaveBeenLastCalledWith(true, "0,1,2,3,4,5");
  });
});
