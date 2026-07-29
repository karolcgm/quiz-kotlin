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
});
