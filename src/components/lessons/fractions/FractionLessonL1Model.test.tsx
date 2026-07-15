/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  FractionLessonL1Model,
  FractionNumberLine,
} from "@/components/lessons/fractions/FractionLessonL1Model";

afterEach(cleanup);

describe("FractionLessonL1Model — klawiatura, dotyk i diagnostyka", () => {
  it("pokazuje pizzę i pasek oraz diagnozuje nierówne części", () => {
    const { container } = render(<FractionLessonL1Model activity="same-whole" seed={31011} />);
    expect(container.querySelector("[data-fraction-circle]")).toBeInTheDocument();
    expect(screen.getAllByText("Pasek").length).toBeGreaterThan(0);

    fireEvent.change(screen.getByRole("slider", { name: "Przesunięcie jednego cięcia" }), { target: { value: "20" } });
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź równość części" }));
    expect(screen.getByText("Całość została podzielona na części o różnych rozmiarach.")).toBeInTheDocument();
    expect(screen.getByText("Kody diagnostyczne: FRA_UNEQUAL_PARTS")).toHaveClass("sr-only");
  });

  it("synchronizuje model i pionowy zapis w obu kierunkach", () => {
    const { container } = render(<FractionLessonL1Model activity="model-notation" seed={31012} />);
    const initialNumerator = screen.getByLabelText(/licznik, cyfra 1 z/u);
    fireEvent.click(screen.getByRole("button", { name: "+ zaznaczona część" }));
    expect(Number((initialNumerator as HTMLInputElement).value)).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: "Zapis → model" }));
    fireEvent.change(screen.getByLabelText(/licznik, cyfra 1 z/u), { target: { value: "1" } });
    expect(container.querySelector("[data-fraction-circle] [data-selected='true']")).toBeInTheDocument();
  });

  it("oś ma suwak dotykowy oraz alternatywy lewo, prawo i pole wartości", () => {
    const onChange = vi.fn();
    render(<FractionNumberLine value={{ numerator: 1, denominator: 4 }} onChange={onChange} />);
    const slider = screen.getByRole("slider", { name: "Przeciągnij punkt na osi ułamków" });
    fireEvent.pointerDown(slider, { pointerType: "touch" });
    fireEvent.change(slider, { target: { value: "2" } });
    expect(onChange).toHaveBeenLastCalledWith({ numerator: 2, denominator: 4 });

    fireEvent.click(screen.getByRole("button", { name: "prawo →" }));
    expect(onChange).toHaveBeenCalledWith({ numerator: 2, denominator: 4 });
    fireEvent.click(screen.getByRole("button", { name: "← lewo" }));
    expect(onChange).toHaveBeenCalledWith({ numerator: 0, denominator: 4 });
    fireEvent.change(screen.getByRole("spinbutton", { name: "Pole wartości osi — licznik" }), { target: { value: "3" } });
    expect(onChange).toHaveBeenLastCalledWith({ numerator: 3, denominator: 4 });
  });

  it("diagnozuje użycie innej całości w samodzielnej próbie", () => {
    render(<FractionLessonL1Model activity="independent" seed={31015} />);
    fireEvent.click(screen.getByRole("button", { name: "Inna całość" }));
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź trzy reprezentacje" }));
    expect(screen.getByText("Porównywane ułamki odnoszą się do całości o różnych rozmiarach.")).toBeInTheDocument();
    expect(screen.getByText("Kody diagnostyczne: FRA_WHOLE_MISMATCH")).toHaveClass("sr-only");
  });

  it("deklaruje kontrakt orientacji i nie pokazuje uczniowi technicznego wyboru poziomu", () => {
    const { container } = render(<FractionLessonL1Model activity="number-line" seed={31014} />);
    expect(container.querySelector("[data-orientation-contract='portrait-landscape']")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Start" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Dalej" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Mistrzowskie" })).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Wybierz wariant zadania")).not.toBeInTheDocument();
  });
});
