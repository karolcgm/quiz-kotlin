/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Grade4MulDivContinuedLessonLab } from "@/components/lessons/models/Grade4MulDivContinuedLessonLab";

describe("Grade4MulDivContinuedLessonLab", () => {
  afterEach(cleanup);

  it("pokazuje pełny sposób obliczenia 78 : 6 przez rozbijanie", () => {
    render(<Grade4MulDivContinuedLessonLab activity="information" />);
    expect(screen.getByText("6 · 14 = ?")).toBeInTheDocument();
    expect(screen.getByText("78 : 6 = ?")).toBeInTheDocument();
    expect(screen.getByText("78 = 60 + 18")).toBeInTheDocument();
    expect(screen.getByText("60 : 6 + 18 : 6")).toBeInTheDocument();
    expect(screen.getByText("10 + 3")).toBeInTheDocument();
    expect(screen.getByText("78 : 6 = 13")).toBeInTheDocument();
  });

  it("pokazuje mnożenie liczby jednocyfrowej przez dwucyfrową", () => {
    render(<Grade4MulDivContinuedLessonLab activity="multiply" questionNumber={1} questionCount={6} />);
    expect(screen.getByText("3 · 24 =")).toBeInTheDocument();
  });

  it("blokuje klawiaturę urządzenia i przyjmuje poprawny wynik dzielenia", () => {
    const onResultChange = vi.fn();
    render(<Grade4MulDivContinuedLessonLab activity="divide" questionNumber={1} questionCount={6} onResultChange={onResultChange} />);
    const input = screen.getByLabelText("Wynik działania");
    expect(input).toHaveAttribute("inputmode", "none");
    expect(input).toHaveAttribute("readonly");

    const keypad = screen.getByRole("region", { name: "Klawiatura do odpowiedzi" });
    fireEvent.click(within(keypad).getByRole("button", { name: "1" }));
    fireEvent.click(within(keypad).getByRole("button", { name: "3" }));
    fireEvent.click(within(keypad).getByRole("button", { name: "Zatwierdź" }));

    expect(screen.getByRole("status")).toHaveTextContent("Brawo");
    expect(onResultChange).toHaveBeenLastCalledWith(true, "78 : 6 = 13");
  });

  it("podaje wspierającą informację po niepoprawnej odpowiedzi", () => {
    render(<Grade4MulDivContinuedLessonLab activity="mixed" questionNumber={1} questionCount={6} />);
    const keypad = screen.getByRole("region", { name: "Klawiatura do odpowiedzi" });
    fireEvent.click(within(keypad).getByRole("button", { name: "9" }));
    fireEvent.click(within(keypad).getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByRole("status")).toHaveTextContent("Spróbuj innym razem. Poprawny wynik to 117. Dziś bez punktu.");
  });
});
