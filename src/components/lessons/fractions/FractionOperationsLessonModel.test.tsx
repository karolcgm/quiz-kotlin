// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FractionOperationsLessonModel } from "@/components/lessons/fractions/FractionOperationsLessonModel";

describe("FractionOperationsLessonModel", () => {
  afterEach(cleanup);
  it("prowadzi przez trzy zadania liczba naturalna · ułamek bez dodatkowych kalkulatorów", () => {
    render(<FractionOperationsLessonModel activity="operations-3.7-visual" seed={5} />);
    expect(screen.getByRole("heading", { name: "Liczba naturalna · ułamek" })).toBeInTheDocument();
    expect(screen.getByText("Zadanie 1/3")).toBeInTheDocument();
    expect(screen.queryByText("×")).not.toBeInTheDocument();
    const keypad = screen.getByLabelText("Kalkulator do mnożenia ułamków");
    expect(screen.getAllByLabelText("Kalkulator do mnożenia ułamków")).toHaveLength(1);
    screen.getAllByRole("textbox").forEach((input) => {
      expect(input).toHaveAttribute("inputmode", "none");
      expect(input).toHaveAttribute("readonly");
    });
    fireEvent.click(within(keypad).getByRole("button", { name: "2" }));
    fireEvent.click(within(keypad).getByRole("button", { name: "3" }));
    fireEvent.click(within(keypad).getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByText("Zadanie 2/3")).toBeInTheDocument();
  });

  it("wymaga zamiany liczby mieszanej przed mnożeniem", () => {
    render(<FractionOperationsLessonModel activity="operations-3.7-reasoning" seed={2} />);
    expect(screen.getByRole("heading", { name: "Liczba naturalna · liczba mieszana" })).toBeInTheDocument();
    expect(screen.getAllByText(/Najpierw zamień liczbę mieszaną na ułamek niewłaściwy/u).length).toBeGreaterThan(0);
    const keypad = screen.getByLabelText("Kalkulator do mnożenia ułamków");
    expect(screen.getByLabelText("Ułamek niewłaściwy: licznik, cyfra 1 z 1")).not.toBeDisabled();
    expect(screen.getByLabelText("Wynik: licznik, cyfra 1 z 1")).not.toBeDisabled();
    for (const digit of ["4", "3"]) fireEvent.click(within(keypad).getByRole("button", { name: digit }));
    fireEvent.click(screen.getByLabelText("Wynik: licznik, cyfra 1 z 1"));
    for (const digit of ["8", "3"]) fireEvent.click(within(keypad).getByRole("button", { name: digit }));
    expect(screen.getByText("Zadanie 1/3")).toBeInTheDocument();
    fireEvent.click(within(keypad).getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByText("Zadanie 2/3")).toBeInTheDocument();
  });

  it("w wariancie ze skracaniem pozostawia uczniowi wszystkie logiczne kroki", () => {
    const { container } = render(<FractionOperationsLessonModel activity="operations-3.7-context" seed={3} />);
    expect(screen.getByRole("heading", { name: "Skracanie przed mnożeniem" })).toBeInTheDocument();
    expect(container.querySelector("[data-cancellation-example]")).toBeInTheDocument();
    expect(container.querySelectorAll("[data-cancelled-number]").length).toBeGreaterThanOrEqual(4);
    const keypad = screen.getByLabelText("Kalkulator do mnożenia ułamków");
    const reducedNatural = screen.getByLabelText("Liczba naturalna po skróceniu: liczba, cyfra 1 z 1");
    const reducedDenominator = screen.getByLabelText("Mianownik po skróceniu: liczba, cyfra 1 z 1");
    const result = screen.getByLabelText("Wynik: liczba, cyfra 1 z 1");
    for (const input of [reducedNatural, reducedDenominator, result]) expect(input).not.toBeDisabled();
    fireEvent.click(within(keypad).getByRole("button", { name: "2" }));
    fireEvent.click(reducedDenominator);
    fireEvent.click(within(keypad).getByRole("button", { name: "1" }));
    fireEvent.click(result);
    fireEvent.click(within(keypad).getByRole("button", { name: "6" }));
    expect(screen.getByText("Zadanie 1/3")).toBeInTheDocument();
    fireEvent.click(within(keypad).getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByText("Zadanie 2/3")).toBeInTheDocument();
    expect(container.querySelector("[data-cancelled-entry-part='denominator']")).toBeInTheDocument();
    expect(screen.getByLabelText("Ułamek niewłaściwy: mianownik, cyfra 1 z 1")).not.toBeDisabled();
  });

  it("zachowuje system pięciu osobnych przykładów i wspólną klawiaturę", () => {
    render(<FractionOperationsLessonModel activity="operations-3.9-independent" seed={1} questionNumber={4} questionCount={5} />);
    expect(screen.getByText("Zadanie 4/5")).toBeInTheDocument();
    expect(screen.getAllByText("5/6 · 3/10")).toHaveLength(2);
    expect(screen.getByLabelText("Klawiatura ekranowa do ułamków")).toBeInTheDocument();
    expect(screen.getByLabelText("Klawiatura ekranowa do ułamków")).toHaveAttribute("data-lesson-numeric-keypad", "shared");
    expect(screen.queryByRole("button", { name: "Pokaż następny krok rozumowania" })).not.toBeInTheDocument();
    expect(screen.getByText("Podpowiedź pojawi się dopiero po własnej próbie.")).toBeInTheDocument();
  });

  it("pozwala zaznaczyć jedną piątą z 15 koralików i zapisać obliczenie", () => {
    const report = vi.fn();
    render(<FractionOperationsLessonModel activity="operations-3.8-visual" seed={0} onResultChange={report} />);
    expect(screen.getByRole("heading", { name: "Jedna piąta z 15 koralików" })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /Koralik/u })).toHaveLength(15);
    for (const bead of ["Koralik 1", "Koralik 2", "Koralik 3"]) fireEvent.click(screen.getByRole("button", { name: bead }));
    expect(screen.getByText("Zaznaczono: 3 z 15 koralików")).toBeInTheDocument();
    const result = screen.getByLabelText("Wynik obliczenia");
    expect(result).toHaveAttribute("inputmode", "none");
    expect(result).toHaveAttribute("readonly");
    const keypad = screen.getByLabelText("Kalkulator do zaznaczania ułamka liczby");
    for (const digit of ["1", "3", "3"]) fireEvent.click(within(keypad).getByRole("button", { name: digit }));
    fireEvent.click(within(keypad).getByRole("button", { name: "Zatwierdź" }));
    expect(report).toHaveBeenLastCalledWith(true, "3 koraliki");
  });

  it("pokazuje trzy ósme pionowo i daje miejsce na obliczenie na slajdzie z 24 koralikami", () => {
    const report = vi.fn();
    const { container } = render(<FractionOperationsLessonModel activity="operations-3.8-L2-visual" seed={0} onResultChange={report} />);
    const displayedFraction = container.querySelector("[data-bead-task-fraction='3-8']");
    expect(displayedFraction).toHaveTextContent("3");
    expect(displayedFraction).toHaveTextContent("8");
    expect(screen.getAllByRole("button", { name: /Koralik/u })).toHaveLength(24);
    for (let bead = 1; bead <= 9; bead += 1) fireEvent.click(screen.getByRole("button", { name: `Koralik ${bead}` }));
    const keypad = screen.getByLabelText("Kalkulator do zaznaczania ułamka liczby");
    for (const digit of ["1", "3", "9"]) fireEvent.click(within(keypad).getByRole("button", { name: digit }));
    fireEvent.click(within(keypad).getByRole("button", { name: "Zatwierdź" }));
    expect(report).toHaveBeenLastCalledWith(true, "9 koralików");
  });

  it("prowadzi przez przykład jednej szóstej liczby 20 z aktywnymi kratkami", () => {
    render(<FractionOperationsLessonModel activity="operations-3.8-reasoning" seed={0} />);
    expect(screen.getByText("Oblicz jedną szóstą liczby 20. Zapisz również liczbę mieszaną.")).toBeInTheDocument();
    const keypad = screen.getByLabelText("Kalkulator do ułamka liczby naturalnej");
    const enter = (label: string, digits: string[]) => {
      const input = screen.getByLabelText(label);
      expect(input).not.toBeDisabled();
      fireEvent.click(input);
      for (const digit of digits) fireEvent.click(within(keypad).getByRole("button", { name: digit }));
    };
    enter("Mianownik po skróceniu: liczba, cyfra 1 z 1", ["3"]);
    enter("Liczba naturalna po skróceniu: liczba, cyfra 1 z 2", ["1", "0"]);
    enter("Wynik działania: licznik, cyfra 1 z 2", ["1", "0", "3"]);
    enter("Liczba mieszana: część całkowita, cyfra 1 z 1", ["3"]);
    enter("Liczba mieszana: licznik, cyfra 1 z 1", ["1", "3"]);
    expect(screen.getByText("Zadanie 1/5")).toBeInTheDocument();
    fireEvent.click(within(keypad).getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByText("Zadanie 2/5")).toBeInTheDocument();
  });

  it("kończy temat zadaniami tekstowymi i odrębnym zestawem L2", () => {
    const { rerender } = render(<FractionOperationsLessonModel activity="operations-3.8-context" seed={0} />);
    expect(screen.getByRole("heading", { name: "Zadania tekstowe" })).toBeInTheDocument();
    expect(screen.getByText(/Ogrodnik ma 28 sadzonek/u)).toBeInTheDocument();
    expect(screen.getAllByLabelText("Kalkulator do ułamka liczby naturalnej")).toHaveLength(1);
    rerender(<FractionOperationsLessonModel activity="operations-3.8-L2-reasoning" seed={0} />);
    expect(screen.getByText("Oblicz siedem dwunastych liczby 84.")).toBeInTheDocument();
    expect(screen.queryByText("Oblicz jedną szóstą liczby 20. Zapisz również liczbę mieszaną.")).not.toBeInTheDocument();
  });

  it("używa osobnych modeli podziału i pomiaru zamiast zastępczej pizzy", () => {
    const { rerender } = render(<FractionOperationsLessonModel activity="operations-3.10-visual" seed={0} />);
    expect(screen.getByLabelText(/podzielone na 3 równe grupy/u)).toBeInTheDocument();
    expect(screen.queryByLabelText(/Interaktywna pizza/u)).not.toBeInTheDocument();
    rerender(<FractionOperationsLessonModel activity="operations-3.11-visual" seed={0} />);
    expect(screen.getByLabelText(/Miara 1\/2 w 3\/4/u)).toBeInTheDocument();
    expect(screen.queryByLabelText(/Interaktywna pizza/u)).not.toBeInTheDocument();
  });

  it("po odsłonięciu kroku podświetla przekątne i skreśla właściwe pary mnożenia", () => {
    render(<FractionOperationsLessonModel activity="operations-3.9-reasoning" seed={1} />);
    expect(screen.getByLabelText("Podświetlone pary do skracania po skosie")).toHaveTextContent("Odsłoń pierwszy krok");
    fireEvent.click(screen.getByRole("button", { name: "Pokaż następny krok rozumowania" }));
    expect(screen.getByLabelText("Podświetlone pary do skracania po skosie")).toHaveTextContent("Różowa i turkusowa przekątna");
    expect(screen.getAllByText("1").length).toBeGreaterThan(0);
  });

  it("zgłasza poprawny wynik z końcowego zestawu tematu 3.7", () => {
    const report = vi.fn();
    render(<FractionOperationsLessonModel activity="operations-3.7-independent" seed={1} questionNumber={1} questionCount={5} onResultChange={report} />);
    const keypad = screen.getByLabelText("Kalkulator do mnożenia ułamków");
    fireEvent.click(within(keypad).getByRole("button", { name: "4" }));
    fireEvent.click(within(keypad).getByRole("button", { name: "5" }));
    fireEvent.click(within(keypad).getByRole("button", { name: "Zatwierdź" }));
    expect(report).toHaveBeenLastCalledWith(true, "4/5");
  });
});
