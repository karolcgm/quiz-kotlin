// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CalculatorLessonLab } from "@/components/lessons/everyday/CalculatorLessonLab";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("CalculatorLessonLab", () => {
  it("udostępnia pełny kalkulator ekranowy", () => {
    render(<CalculatorLessonLab activity="calculator-guide" />);
    expect(screen.getByRole("region", { name: "Kalkulator ekranowy" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: ":" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "·" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "=" })).toBeInTheDocument();
  });

  it("poprawnie oblicza działanie z przecinkiem dziesiętnym", () => {
    render(<CalculatorLessonLab activity="calculator-guide" />);
    for (const key of ["2", "4", ",", "6", ":", "3", "="]) {
      fireEvent.click(screen.getByRole("button", { name: key }));
    }
    expect(screen.getByRole("status")).toHaveTextContent("8,2");
  });

  it("blokuje pustą odpowiedź i wyłącza klawiaturę urządzenia", () => {
    render(<CalculatorLessonLab activity="decimal-expansions" />);
    const answer = screen.getByLabelText("Wynik użyty z kalkulatora");
    expect(answer).toHaveAttribute("inputmode", "none");
    expect(answer).toHaveAttribute("readonly");
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź odpowiedź" }));
    expect(screen.getByText("Najpierw wykonaj działanie i użyj wyniku z wyświetlacza.")).toBeInTheDocument();
  });

  it("po poprawnym wyniku przechodzi do kolejnego zadania w tym samym slajdzie", () => {
    vi.useFakeTimers();
    render(<CalculatorLessonLab activity="decimal-expansions" />);
    for (const key of ["7", ":", "8", "="]) {
      fireEvent.click(screen.getByRole("button", { name: key }));
    }
    fireEvent.click(screen.getByRole("button", { name: "Użyj wyniku z wyświetlacza" }));
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź odpowiedź" }));
    expect(screen.getByText(/Dobrze!/u)).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(700));
    expect(screen.getByText("Zadanie 2/6")).toBeInTheDocument();
  });

  it("po zmianie slajdu zaczyna nową serię od pierwszego zadania", () => {
    const view = render(<CalculatorLessonLab activity="division-remainders" readOnly />);
    const navigator = view.container.querySelector("[data-lesson-task-navigator]");
    expect(navigator).not.toBeNull();
    const next = navigator!.querySelectorAll("button")[1];
    for (let step = 0; step < 4; step += 1) fireEvent.click(next);
    expect(screen.getAllByText("Zadanie 5/5").length).toBeGreaterThan(0);

    view.rerender(<CalculatorLessonLab activity="calculator-stories" readOnly />);

    expect(screen.getAllByText("Zadanie 1/6").length).toBeGreaterThan(0);
    const resetNavigator = view.container.querySelector("[data-lesson-task-navigator]");
    expect(resetNavigator?.querySelectorAll("button")[0]).toBeDisabled();
  });

  it("pozwala nauczycielowi przechodzić wstecz także w trybie interaktywnym", () => {
    const view = render(<CalculatorLessonLab activity="division-remainders" />);
    const navigator = view.container.querySelector("[data-lesson-task-navigator]");
    expect(navigator).not.toBeNull();
    const [previous, next] = Array.from(navigator!.querySelectorAll("button"));
    expect(previous).toBeDisabled();
    fireEvent.click(next);
    expect(previous).not.toBeDisabled();
  });

  it("czyści przeniesioną odpowiedź po zmianie identyfikatora slajdu", () => {
    const view = render(<CalculatorLessonLab slideId="slide-a" activity="decimal-expansions" />);
    for (const key of ["7", ":", "8", "="]) {
      fireEvent.click(screen.getByRole("button", { name: key }));
    }
    fireEvent.click(screen.getByRole("button", { name: /wyniku z wyświetlacza/i }));
    expect(screen.getByLabelText(/wynik użyty z kalkulatora/i)).toHaveValue("0,875");

    view.rerender(<CalculatorLessonLab slideId="slide-b" activity="decimal-expansions" />);

    expect(screen.getByLabelText(/wynik użyty z kalkulatora/i)).toHaveValue("");
    expect(screen.getByRole("button", { name: "7" })).not.toBeDisabled();
  });

  it("pozwala usunąć przeniesiony wynik i wykonać obliczenie ponownie", () => {
    render(<CalculatorLessonLab activity="decimal-expansions" />);
    for (const key of ["7", ":", "8", "="]) {
      fireEvent.click(screen.getByRole("button", { name: key }));
    }
    fireEvent.click(screen.getByRole("button", { name: /wyniku z wyświetlacza/i }));
    fireEvent.click(screen.getByRole("button", { name: "Zmień wynik" }));

    expect(screen.getByLabelText(/wynik użyty z kalkulatora/i)).toHaveValue("");
    expect(screen.getByRole("button", { name: "7" })).not.toBeDisabled();
  });
});
