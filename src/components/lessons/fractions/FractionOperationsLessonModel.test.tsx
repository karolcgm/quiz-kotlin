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
    render(<FractionOperationsLessonModel activity="operations-3.7-context" seed={3} />);
    expect(screen.getByRole("heading", { name: "Skracanie przed mnożeniem" })).toBeInTheDocument();
    const keypad = screen.getByLabelText("Kalkulator do mnożenia ułamków");
    for (const digit of ["2", "1", "6"]) {
      fireEvent.click(within(keypad).getByRole("button", { name: digit }));
      fireEvent.click(within(keypad).getByRole("button", { name: "Zatwierdź" }));
    }
    expect(screen.getByText("Zadanie 2/3")).toBeInTheDocument();
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

  it("synchronizuje grupy z pionowym zapisem modelu", () => {
    render(<FractionOperationsLessonModel activity="operations-3.8-visual" seed={0} />);
    expect(screen.getByLabelText("Zapis modelu: 1/3")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "grupa 2" }));
    expect(screen.getByLabelText("Zapis modelu: 2/3")).toBeInTheDocument();
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
