/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Grade4OrderOfOperationsLessonLab } from "@/components/lessons/models/Grade4OrderOfOperationsLessonLab";

const typeNumber = (value: string) => { for (const digit of value) fireEvent.click(screen.getByRole("button", { name: digit })); };

describe("Grade4OrderOfOperationsLessonLab", () => {
  afterEach(cleanup);
  it("wyjaśnia pełną kolejność oraz kierunek od lewej do prawej", () => {
    render(<Grade4OrderOfOperationsLessonLab activity="information" />);
    expect(screen.getByText("Nawiasy")).toBeInTheDocument();
    expect(screen.getByText("Potęgi")).toBeInTheDocument();
    expect(screen.getByText("24 : 6 · 3 = 4 · 3 = 12")).toBeInTheDocument();
    expect(screen.getByText("18 − 7 + 5 = 11 + 5 = 16")).toBeInTheDocument();
  });
  it("blokuje klawiaturę urządzenia i pokazuje klawiaturę lekcyjną", () => {
    render(<Grade4OrderOfOperationsLessonLab activity="practice" questionNumber={5} questionCount={8} />);
    for (const input of screen.getAllByRole("textbox")) { expect(input).toHaveAttribute("inputmode", "none"); expect(input).toHaveAttribute("readonly"); }
    expect(screen.getByLabelText("Klawiatura do obliczeń krok po kroku")).toBeInTheDocument();
  });
  it.each([
    { questionNumber: 1, answers: ["9"], revealedLabels: ["9 + 4"] },
    { questionNumber: 2, answers: ["6"], revealedLabels: ["6 · 3"] },
    { questionNumber: 3, answers: ["4"], revealedLabels: ["4 · 2"] },
    { questionNumber: 4, answers: ["12"], revealedLabels: ["12 + 4"] },
    { questionNumber: 5, answers: ["4", "12"], revealedLabels: ["3 · 4", "4 + 12"] },
    { questionNumber: 6, answers: ["12", "4"], revealedLabels: ["12 : 3", "30 − 4"] },
    { questionNumber: 7, answers: ["6", "36"], revealedLabels: ["6²", "36 : 9"] },
    { questionNumber: 8, answers: ["8", "6"], revealedLabels: ["48 : 8", "6 + 8"] },
  ])("odsłania kolejne działania dopiero po poprawnych wynikach w zadaniu $questionNumber", ({ questionNumber, answers, revealedLabels }) => {
    render(<Grade4OrderOfOperationsLessonLab activity="practice" questionNumber={questionNumber} questionCount={8} />);

    for (const [index, answer] of answers.entries()) {
      const revealedLabel = revealedLabels[index]!;
      expect(screen.queryByText(revealedLabel)).not.toBeInTheDocument();
      expect(screen.getByLabelText(`Krok ${index + 2} jest jeszcze zablokowany`)).toBeDisabled();

      typeNumber(answer);

      expect(screen.getByText(revealedLabel)).toBeInTheDocument();
      expect(screen.getByLabelText(`Wynik kroku ${index + 2}: ${revealedLabel}`)).not.toBeDisabled();
    }
  });
  it("zalicza wszystkie wyniki zapisane pod działaniami", () => {
    const onResultChange = vi.fn();
    render(<Grade4OrderOfOperationsLessonLab activity="practice" questionNumber={5} questionCount={8} onResultChange={onResultChange} />);
    typeNumber("4");
    fireEvent.click(screen.getByLabelText("Wynik kroku 2: 3 · 4")); typeNumber("12");
    fireEvent.click(screen.getByLabelText("Wynik kroku 3: 4 + 12")); typeNumber("16");
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
    expect(onResultChange).toHaveBeenLastCalledWith(true, "2² = 4, 3 · 4 = 12, 4 + 12 = 16");
  });
  it("wymaga uzupełnienia każdego kroku", () => {
    const onResultChange = vi.fn();
    render(<Grade4OrderOfOperationsLessonLab activity="practice" questionNumber={2} questionCount={8} onResultChange={onResultChange} />);
    typeNumber("6"); fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Uzupełnij wyniki wszystkich kroków.");
    expect(onResultChange).not.toHaveBeenCalledWith(expect.any(Boolean), expect.any(String));
  });
  it("po błędzie podaje wspierającą informację zwrotną", () => {
    render(<Grade4OrderOfOperationsLessonLab activity="practice" questionNumber={3} questionCount={8} />);
    typeNumber("4"); fireEvent.click(screen.getByLabelText("Wynik kroku 2: 4 · 2")); typeNumber("10");
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByRole("status")).toHaveTextContent("Spróbuj innym razem. Poprawne wyniki to: 20 : 5 = 4, 4 · 2 = 8. Dziś bez punktu.");
  });
});
