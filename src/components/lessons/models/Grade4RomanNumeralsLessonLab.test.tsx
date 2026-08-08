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

  it("checks whether a natural-Roman pair is correct", () => {
    const onResultChange = vi.fn();
    render(<Grade4RomanNumeralsLessonLab activity="check-record" questionNumber={2} questionCount={8} onResultChange={onResultChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Nieprawidłowy zapis" }));
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
    expect(onResultChange).toHaveBeenLastCalledWith(true, "nieprawidłowy");
    expect(screen.getByText(/8 = VIII/)).toBeInTheDocument();
  });
});
