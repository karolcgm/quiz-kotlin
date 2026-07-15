// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FractionOperationsLessonModel } from "@/components/lessons/fractions/FractionOperationsLessonModel";

describe("FractionOperationsLessonModel", () => {
  afterEach(cleanup);
  it("pozwala kliknąć pizzę i od razu aktualizuje model", () => {
    render(<FractionOperationsLessonModel activity="operations-3.7-visual" seed={5} />);
    fireEvent.click(screen.getByRole("button", { name: "Zaznacz kawałek 3" }));
    expect(screen.getByLabelText("Interaktywna pizza: 3/5")).toBeInTheDocument();
  });

  it("zachowuje system pięciu osobnych przykładów i wspólną klawiaturę", () => {
    render(<FractionOperationsLessonModel activity="operations-3.9-independent" seed={1} questionNumber={4} questionCount={5} />);
    expect(screen.getByText("Zadanie 4/5")).toBeInTheDocument();
    expect(screen.getAllByText("5/6 × 3/10")).toHaveLength(2);
    expect(screen.getByLabelText("Klawiatura ekranowa do ułamków")).toBeInTheDocument();
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
