/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Grade4NumberLineLessonLab } from "@/components/lessons/models/Grade4NumberLineLessonLab";

const typeNumber = (value: string) => { for (const digit of value) fireEvent.click(screen.getByRole("button", { name: digit })); };

describe("Grade4NumberLineLessonLab", () => {
  afterEach(cleanup);
  it("porównuje oś z termometrem i objaśnia jej elementy", () => {
    render(<Grade4NumberLineLessonLab activity="information" />);
    expect(screen.getByLabelText("Termometr do mierzenia temperatury ciała")).toBeInTheDocument();
    expect(screen.getByText("Odcinek jednostkowy")).toBeInTheDocument();
    expect(screen.getByText("To odległość między sąsiednimi liczbami na osi liczbowej.")).toBeInTheDocument();
    expect(screen.getByLabelText("Oś liczbowa ze strzałką po prawej stronie")).toBeInTheDocument();
  });
  it("umieszcza pola punktów nad osią i blokuje klawiaturę urządzenia", () => {
    render(<Grade4NumberLineLessonLab activity="practice" questionNumber={1} questionCount={6} />);
    for (const letter of ["A", "B", "C"]) { const input = screen.getByLabelText(`Współrzędna punktu ${letter}`); expect(input).toHaveAttribute("inputmode", "none"); expect(input).toHaveAttribute("readonly"); }
    expect(screen.getByLabelText("Klawiatura do odczytywania osi")).toBeInTheDocument();
  });
  it.each([
    { questionNumber: 1, knownValues: [0, 1] },
    { questionNumber: 2, knownValues: [7, 8] },
    { questionNumber: 3, knownValues: [16, 17] },
    { questionNumber: 4, knownValues: [26, 28] },
    { questionNumber: 5, knownValues: [65, 70] },
    { questionNumber: 6, knownValues: [160, 170] },
  ])("rozmieszcza opisane liczby w różnych częściach osi w zadaniu $questionNumber", ({ questionNumber, knownValues }) => {
    render(<Grade4NumberLineLessonLab activity="practice" questionNumber={questionNumber} questionCount={6} />);

    for (const value of knownValues) {
      expect(screen.getByLabelText(`Opisana liczba ${value} na osi`)).toBeInTheDocument();
    }
  });
  it("zalicza poprawnie odczytane punkty", () => {
    const onResultChange = vi.fn();
    render(<Grade4NumberLineLessonLab activity="practice" questionNumber={1} questionCount={6} onResultChange={onResultChange} />);
    typeNumber("2"); fireEvent.click(screen.getByLabelText("Współrzędna punktu B")); typeNumber("5"); fireEvent.click(screen.getByLabelText("Współrzędna punktu C")); typeNumber("8");
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
    expect(onResultChange).toHaveBeenLastCalledWith(true, "A = 2, B = 5, C = 8");
  });
  it("obsługuje inną odległość między sąsiednimi liczbami", () => {
    const onResultChange = vi.fn();
    render(<Grade4NumberLineLessonLab activity="practice" questionNumber={5} questionCount={6} onResultChange={onResultChange} />);
    typeNumber("60"); fireEvent.click(screen.getByLabelText("Współrzędna punktu B")); typeNumber("75"); fireEvent.click(screen.getByLabelText("Współrzędna punktu C")); typeNumber("90");
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
    expect(onResultChange).toHaveBeenLastCalledWith(true, "A = 60, B = 75, C = 90");
  });
  it("nie przyjmuje niepełnej odpowiedzi", () => {
    render(<Grade4NumberLineLessonLab activity="practice" questionNumber={2} questionCount={6} />);
    typeNumber("6"); fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Uzupełnij kratki nad wszystkimi trzema punktami.");
  });
});
