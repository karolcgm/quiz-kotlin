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
  it("odsłania liczbę 9 dopiero po obliczeniu pierwszego działania", () => {
    render(<Grade4OrderOfOperationsLessonLab activity="practice" questionNumber={1} questionCount={8} />);

    expect(screen.queryByText("9 + 4")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Krok 2 jest jeszcze zablokowany")).toBeDisabled();

    typeNumber("9");

    expect(screen.getByText("9 + 4")).toBeInTheDocument();
    expect(screen.getByLabelText("Wynik kroku 2: 9 + 4")).not.toBeDisabled();
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
