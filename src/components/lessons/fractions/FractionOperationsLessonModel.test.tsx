// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FractionOperationsLessonModel } from "@/components/lessons/fractions/FractionOperationsLessonModel";

describe("FractionOperationsLessonModel", () => {
  afterEach(cleanup);
  it("pozwala kliknąć pizzę i od razu aktualizuje model", () => {
    render(<FractionOperationsLessonModel activity="operations-3.7-visual" seed={5} />);
    expect(screen.getByLabelText("Zapis modelu: 6/5")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Zaznacz porcja 1, kawałek 3" }));
    expect(screen.getByLabelText("Interaktywna pizza: 3/5")).toBeInTheDocument();
    expect(screen.getByLabelText("Zapis modelu: 9/5")).toBeInTheDocument();
  });

  it("zachowuje system pięciu osobnych przykładów i wspólną klawiaturę", () => {
    render(<FractionOperationsLessonModel activity="operations-3.9-independent" seed={1} questionNumber={4} questionCount={5} />);
    expect(screen.getByText("Zadanie 4/5")).toBeInTheDocument();
    expect(screen.getAllByText("5/6 × 3/10")).toHaveLength(2);
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

  it("wykrywa błędne mnożenie mianownika w temacie 3.7", () => {
    const report = vi.fn();
    render(<FractionOperationsLessonModel activity="operations-3.7-independent" seed={1} questionNumber={1} questionCount={5} onResultChange={report} />);
    fireEvent.change(screen.getByLabelText("licznik, cyfra 1 z 1"), { target: { value: "6" } });
    fireEvent.change(screen.getByLabelText("mianownik, cyfra 1 z 1"), { target: { value: "1" } });
    fireEvent.change(screen.getByLabelText("mianownik, cyfra 2 z 2"), { target: { value: "5" } });
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź odpowiedź" }));
    expect(screen.getByText(/Pomnożono także mianownik/u)).toBeInTheDocument();
    expect(report).toHaveBeenLastCalledWith(false, "6/15");
  });
});
