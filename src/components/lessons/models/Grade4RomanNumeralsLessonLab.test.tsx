// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Grade4RomanNumeralsLessonLab } from "@/components/lessons/models/Grade4RomanNumeralsLessonLab";

describe("Grade4RomanNumeralsLessonLab", () => {
  afterEach(() => cleanup());
  it("presents the first-meeting symbols and rules", () => {
    render(<Grade4RomanNumeralsLessonLab activity="information" />);
    expect(screen.getByText("Pierwsze spotkanie z systemem rzymskim")).toBeInTheDocument();
    expect(screen.getByText("XIII = 10 + 1 + 1 + 1 = 13")).toBeInTheDocument();
    expect(screen.getByText("IV = 5 − 1 = 4")).toBeInTheDocument();
  });

  it("reads a Roman number using a read-only keypad field", () => {
    const onResultChange = vi.fn();
    render(<Grade4RomanNumeralsLessonLab activity="read" questionNumber={3} questionCount={8} onResultChange={onResultChange} />);
    const input = screen.getByLabelText("Liczba naturalna");
    expect(input).toHaveAttribute("inputmode", "none");
    expect(input).toHaveAttribute("readonly");
    fireEvent.click(screen.getByRole("button", { name: "1" }));
    fireEvent.click(screen.getByRole("button", { name: "4" }));
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
    expect(onResultChange).toHaveBeenLastCalledWith(true, "14");
  });

  it("writes a Roman number with the lesson keypad", () => {
    const onResultChange = vi.fn();
    render(<Grade4RomanNumeralsLessonLab activity="write" questionNumber={5} questionCount={8} onResultChange={onResultChange} />);
    const input = screen.getByLabelText("Zapis rzymski");
    expect(input).toHaveAttribute("inputmode", "none");
    expect(input).toHaveAttribute("readonly");
    for (const key of ["X", "X", "I", "V"]) fireEvent.click(screen.getByRole("button", { name: key }));
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
    expect(onResultChange).toHaveBeenLastCalledWith(true, "XXIV");
  });

  it("opens the treasure chest with a three-part Roman code", () => {
    const onResultChange = vi.fn();
    render(<Grade4RomanNumeralsLessonLab activity="treasure-code" questionNumber={1} questionCount={1} onResultChange={onResultChange} />);

    fireEvent.click(screen.getByRole("button", { name: "Kod dla liczby 40" }));
    for (const key of ["X", "L"]) fireEvent.click(screen.getByRole("button", { name: key }));
    fireEvent.click(screen.getByRole("button", { name: "Kod dla liczby 9" }));
    for (const key of ["I", "X"]) fireEvent.click(screen.getByRole("button", { name: key }));
    fireEvent.click(screen.getByRole("button", { name: "Kod dla liczby 24" }));
    for (const key of ["X", "X", "I", "V"]) fireEvent.click(screen.getByRole("button", { name: key }));
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));

    expect(onResultChange).toHaveBeenLastCalledWith(true, "XL · IX · XXIV");
    expect(screen.getByText(/Skrzynia otwarta/)).toBeInTheDocument();
  });

  it("checks all correct natural-Roman pairs as one task", () => {
    const onResultChange = vi.fn();
    render(<Grade4RomanNumeralsLessonLab activity="check-record" questionNumber={1} questionCount={1} onResultChange={onResultChange} />);
    for (const pair of ["4 = IV", "14 = XIV", "24 = XXIV", "29 = XXIX", "44 = XLIV"]) {
      fireEvent.click(screen.getByRole("button", { name: pair }));
    }
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
    expect(onResultChange).toHaveBeenLastCalledWith(true, "4 = IV, 14 = XIV, 24 = XXIV, 29 = XXIX, 44 = XLIV");
    expect(screen.getByText(/Zaznaczono wszystkie prawidłowe zapisy/)).toBeInTheDocument();
  });
});
