/** @vitest-environment jsdom */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FractionLessonL1Model } from "@/components/lessons/fractions/FractionLessonL1Model";
import { FractionLessonL2Model, MixedNumberLine } from "@/components/lessons/fractions/FractionLessonL2Model";

afterEach(cleanup);

describe("FractionLessonL2Model — klawiatura, dotyk, tablet i diagnostyka", () => {
  it("pokazuje 7/4 na dwóch kołach i nie traktuje ułamka niewłaściwego jako błędu", () => {
    const onResultChange = vi.fn();
    const { container } = render(<FractionLessonL2Model activity="more-than-one-pizza" seed={31201} onResultChange={onResultChange} />);
    expect(container.querySelectorAll("[data-fraction-circle]")).toHaveLength(2);
    fireEvent.click(screen.getByRole("button", { name: "ułamek niewłaściwy" }));
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź rozpoznanie" }));
    expect(screen.getByText(/7\/4 jest poprawnym ułamkiem niewłaściwym/u)).toBeInTheDocument();
    expect(onResultChange).toHaveBeenLastCalledWith(true, "7/4 — ułamek niewłaściwy");
    expect(screen.queryByText(/Zamiana pominęła/u)).not.toBeInTheDocument();
  });

  it("grupuje pełną całość przyciskiem o dużym celu dotykowym", () => {
    const { container } = render(<FractionLessonL2Model activity="group-wholes" seed={31202} />);
    fireEvent.click(screen.getByRole("button", { name: "Zgrupuj cztery ćwiartki w całość" }));
    expect(container.querySelector("[data-grouped='true']")).toBeInTheDocument();
    expect(screen.getByText("1 całość")).toBeInTheDocument();
    expect(screen.getByText("reszta 3/4")).toBeInTheDocument();
  });

  it("istniejący adapter fraction-lesson kieruje etap L2 do nowego modelu", () => {
    const { container } = render(<FractionLessonL1Model activity="mixed-number-line" seed={31204} />);
    expect(container.querySelector("[data-fraction-lesson-l2]")).toBeInTheDocument();
    expect(container.querySelector("[data-orientation-contract='portrait-landscape']")).toBeInTheDocument();
  });

  it("oś obsługuje granice 1 i 2, wartości między kreskami i klawiaturowe pole numeru kreski", () => {
    const onChange = vi.fn();
    const { rerender } = render(<MixedNumberLine denominator={4} numerator={4} onChange={onChange} />);
    expect(screen.getByLabelText("Numer kreski osi mieszanej")).toHaveValue(4);
    rerender(<MixedNumberLine denominator={4} numerator={7} onChange={onChange} />);
    expect(screen.getByLabelText("Numer kreski osi mieszanej")).toHaveValue(7);
    rerender(<MixedNumberLine denominator={4} numerator={8} onChange={onChange} />);
    expect(screen.getByLabelText("Numer kreski osi mieszanej")).toHaveValue(8);
    fireEvent.change(screen.getByLabelText("Numer kreski osi mieszanej"), { target: { value: "9" } });
    expect(onChange).toHaveBeenCalledWith(9);
  });

  it("utrwala łącznik całości × mianownik + licznik krok po kroku", () => {
    const { container } = render(<FractionLessonL2Model activity="convert-both-ways" seed={31203} />);
    expect(container.querySelector("[data-conversion-connector]")).toHaveTextContent("całości × mianownik + licznik");
    fireEvent.click(screen.getByRole("button", { name: "Następny krok →" }));
    expect(container.querySelector("[data-conversion-connector]")).toHaveTextContent("1 × 4");
  });

  it("ma jawny kontrakt tablet portrait/landscape, reduced motion, dotyku i druku", () => {
    const css = readFileSync(resolve(process.cwd(), "src/components/lessons/fractions/fractionLessonL2.module.css"), "utf8");
    expect(css).toContain("min-width: 44px");
    expect(css).toContain("min-height: 44px");
    expect(css).toContain("@media (orientation: portrait) and (max-width: 1024px)");
    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
    expect(css).toContain("@media print");
  });
});
