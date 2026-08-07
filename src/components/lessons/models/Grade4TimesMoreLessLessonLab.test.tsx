/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Grade4TimesMoreLessLessonLab } from "@/components/lessons/models/Grade4TimesMoreLessLessonLab";

describe("Grade4TimesMoreLessLessonLab", () => {
  afterEach(cleanup);

  it("pokazuje mnożenie, dzielenie i porównanie ilorazowe", () => {
    render(<Grade4TimesMoreLessLessonLab activity="information" />);
    expect(screen.getByText("6 · 4 = 24")).toBeInTheDocument();
    expect(screen.getByText("24 : 4 = 6")).toBeInTheDocument();
    expect(screen.getByText("24 : 6 = 4")).toBeInTheDocument();
  });

  it("blokuje klawiaturę urządzenia i przyjmuje poprawny wynik", () => {
    const onResultChange = vi.fn();
    render(<Grade4TimesMoreLessLessonLab activity="practice" questionNumber={1} questionCount={6} onResultChange={onResultChange} />);

    const input = screen.getByLabelText("Wynik");
    expect(input).toHaveAttribute("inputmode", "none");
    expect(input).toHaveAttribute("readonly");

    const keypad = screen.getByRole("region", { name: "Klawiatura do odpowiedzi" });
    fireEvent.click(within(keypad).getByRole("button", { name: "4" }));
    fireEvent.click(within(keypad).getByRole("button", { name: "2" }));
    fireEvent.click(within(keypad).getByRole("button", { name: "Zatwierdź" }));

    expect(screen.getByRole("status")).toHaveTextContent("Brawo");
    expect(onResultChange).toHaveBeenLastCalledWith(true, "42");
  });

  it("w zadaniu odwrotnym pokazuje kratkę na początku zdania", () => {
    render(<Grade4TimesMoreLessLessonLab activity="reverse" questionNumber={1} questionCount={4} />);
    const input = screen.getByLabelText("Wynik");
    const label = input.closest("label");
    expect(label).toHaveTextContent("to 4 razy więcej niż 6.");
    expect(label?.firstElementChild).toBe(input);
  });

  it("wymaga obu odpowiedzi w zadaniu z treścią", () => {
    const onResultChange = vi.fn();
    render(<Grade4TimesMoreLessLessonLab activity="stories" questionNumber={1} questionCount={4} onResultChange={onResultChange} />);

    expect(screen.getByAltText("Dwoje dzieci porównuje dwa zestawy naklejek")).toBeInTheDocument();
    const first = screen.getByLabelText("Odpowiedź a: liczba naklejek Olka");
    const second = screen.getByLabelText("Odpowiedź b: łączna liczba naklejek");
    const keypad = screen.getByRole("region", { name: "Klawiatura do odpowiedzi" });

    fireEvent.click(first);
    fireEvent.click(within(keypad).getByRole("button", { name: "2" }));
    fireEvent.click(within(keypad).getByRole("button", { name: "4" }));
    fireEvent.click(second);
    fireEvent.click(within(keypad).getByRole("button", { name: "3" }));
    fireEvent.click(within(keypad).getByRole("button", { name: "0" }));
    fireEvent.click(within(keypad).getByRole("button", { name: "Zatwierdź" }));

    expect(screen.getByRole("status")).toHaveTextContent("Brawo");
    expect(onResultChange).toHaveBeenLastCalledWith(true, "24, 30");
  });

  it("podaje wspierający komunikat po niepoprawnej odpowiedzi", () => {
    render(<Grade4TimesMoreLessLessonLab activity="practice" questionNumber={3} questionCount={6} />);
    const keypad = screen.getByRole("region", { name: "Klawiatura do odpowiedzi" });
    fireEvent.click(within(keypad).getByRole("button", { name: "3" }));
    fireEvent.click(within(keypad).getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByRole("status")).toHaveTextContent("Spróbuj innym razem. Poprawny wynik to 4. Dziś bez punktu.");
  });
});
