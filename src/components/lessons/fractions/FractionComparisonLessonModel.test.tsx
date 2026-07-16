/** @vitest-environment jsdom */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FractionComparisonLessonModel } from "@/components/lessons/fractions/FractionComparisonLessonModel";
import { FractionLessonL1Model } from "@/components/lessons/fractions/FractionLessonL1Model";

afterEach(cleanup);

describe("FractionComparisonLessonModel — modele, pionowy zapis, dotyk i diagnostyka", () => {
  it("prowadzi zadania z jednakowymi mianownikami w kolejnych zakładkach", () => {
    const { container } = render(<FractionComparisonLessonModel activity="same-denominator" seed={34041} />);
    expect(screen.getByText("Jednakowe mianowniki")).toBeInTheDocument();
    expect(screen.getByText("Zadanie 1/5")).toBeInTheDocument();
    expect(container.querySelectorAll("[data-fraction-circle]").length).toBeGreaterThanOrEqual(2);
    expect(container.querySelector("[data-fraction-shape='circle']")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Zadanie 2" })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "Wstaw znak <" }));
    fireEvent.click(screen.getByRole("button", { name: "Prześlij zadanie" }));
    expect(screen.getByRole("status")).toHaveTextContent(/Następne zadanie jest już odblokowane/u);
    expect(screen.getByRole("tab", { name: "Zadanie 2" })).not.toBeDisabled();
    fireEvent.click(screen.getByRole("tab", { name: "Zadanie 2" }));
    expect(container.querySelector("[data-fraction-shape='triangles']")).toBeInTheDocument();
  });

  it("obejmuje ułamki niewłaściwe i liczby mieszane przy jednakowych licznikach", () => {
    render(<FractionComparisonLessonModel activity="same-numerator" seed={34042} />);
    fireEvent.click(screen.getByRole("button", { name: "Wstaw znak >" }));
    fireEvent.click(screen.getByRole("button", { name: "Prześlij zadanie" }));
    fireEvent.click(screen.getByRole("tab", { name: "Zadanie 2" }));
    fireEvent.click(screen.getByRole("button", { name: "Wstaw znak <" }));
    fireEvent.click(screen.getByRole("button", { name: "Prześlij zadanie" }));
    fireEvent.click(screen.getByRole("tab", { name: "Zadanie 3" }));
    expect(screen.getByLabelText("7/3")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Wstaw znak >" }));
    fireEvent.click(screen.getByRole("button", { name: "Prześlij zadanie" }));
    fireEvent.click(screen.getByRole("tab", { name: "Zadanie 4" }));
    expect(screen.getByLabelText("1 2/7")).toBeInTheDocument();
    expect(screen.getByLabelText("1 2/5")).toBeInTheDocument();
  });

  it("pokazuje gotowy, kolorowy przykład motylkowy i pola iloczynów", () => {
    const { container } = render(<FractionComparisonLessonModel activity="cross-multiplication" seed={34043} />);
    expect(container.querySelector("[data-cross-product='left']")).toHaveTextContent("3");
    expect(container.querySelector("[data-cross-operand='left-numerator']")).toHaveAttribute("data-cross-highlight", "cyan");
    expect(container.querySelector("[data-cross-operand='right-denominator']")).toHaveAttribute("data-cross-highlight", "cyan");
    expect(container.querySelector("[data-cross-product='right']")).toHaveTextContent("4");
    expect(container.querySelector("[data-cross-operand='right-numerator']")).toHaveAttribute("data-cross-highlight", "violet");
    expect(container.querySelector("[data-cross-operand='left-denominator']")).toHaveAttribute("data-cross-highlight", "violet");
    expect(screen.getByLabelText("trzy jest mniejsze od czterech")).toHaveTextContent("<");
    expect(screen.getByText(/3 < 4/u)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Iloczyn nad pierwszym ułamkiem" })).toHaveTextContent("□");
    expect(screen.getByRole("button", { name: "Iloczyn nad drugim ułamkiem" })).toHaveTextContent("□");
    expect(screen.getByLabelText("Klawiatura do iloczynów motylkowych")).toBeInTheDocument();
  });

  it("zatrzymuje porównanie pasków, gdy całości nie są wspólne", () => {
    const { container } = render(<FractionComparisonLessonModel activity="overlay-bars" seed={34041} />);
    fireEvent.click(screen.getByRole("button", { name: "Inna całość — pułapka" }));
    fireEvent.click(screen.getByRole("button", { name: "Wstaw znak >" }));
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź porównanie pasków" }));
    expect(screen.getAllByText(/całości o różnych rozmiarach/u).length).toBeGreaterThan(0);
    expect(container.querySelector("[data-whole-size='.78']")).toBeInTheDocument();
  });

  it("aktualizuje dwa punkty wspólnej osi w czasie rzeczywistym i sprawdza znak", () => {
    const { container } = render(<FractionComparisonLessonModel activity="common-axis" seed={34042} />);
    expect(container.querySelector("[data-axis-point='A']")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Przeciągnij punkt A"), { target: { value: "1" } });
    expect(container.querySelector("span[aria-label='1/3']")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Wstaw znak <" }));
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź położenie punktów" }));
    expect(screen.getByRole("status")).toHaveTextContent(/Znak jest poprawny/u);
  });

  it("najpierw wyjaśnia na modelu 1/8 i 1/6, a potem prowadzi serię znaków", () => {
    render(<FractionComparisonLessonModel activity="denominator-trap" seed={34044} />);
    expect(screen.getByLabelText("Przykład: 1/8 < 1/6")).toBeInTheDocument();
    expect(screen.getByText(/mniejszym mianownikiem/u)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Wstaw znak <" }));
    fireEvent.click(screen.getByRole("button", { name: "Prześlij zadanie" }));
    expect(screen.getByRole("status")).toHaveTextContent(/Następne zadanie/u);
  });

  it("pozwala wybrać najkrótszą strategię i pokazuje wspólny pionowy mianownik", () => {
    const { container } = render(<FractionComparisonLessonModel activity="shortest-strategy" seed={34043} />);
    fireEvent.click(screen.getByRole("button", { name: /Wspólny mianownik/u }));
    expect(container.querySelector("[data-strategy-evidence='common-denominator']")).toBeInTheDocument();
    expect(container.querySelectorAll("[data-decisive-member='true']")).toHaveLength(2);
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź najkrótszą strategię" }));
    expect(screen.getByRole("status")).toHaveTextContent(/bez zbędnych kroków/u);
  });

  it("zamienia dawny slajd dronów na proste porównania ze znakiem", () => {
    const onResultChange = vi.fn();
    render(<FractionComparisonLessonModel activity="drone-race" seed={34045} onResultChange={onResultChange} />);
    expect(screen.getByRole("heading", { name: "Różne liczniki i mianowniki" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Wstaw znak <" }));
    fireEvent.click(screen.getByRole("button", { name: "Prześlij zadanie" }));
    expect(onResultChange).toHaveBeenLastCalledWith(null, expect.stringContaining("2/3 < 3/4"));
  });

  it("zamienia dawną samodzielną próbę na metodę motylkową", () => {
    const onResultChange = vi.fn();
    const { container } = render(<FractionLessonL1Model activity="independent-comparison" seed={34402} difficulty="core" onResultChange={onResultChange} />);
    expect(container.querySelector("[data-fraction-comparison-l1][data-fraction-activity='cross-multiplication']")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Metoda motylkowa" })).toBeInTheDocument();
    expect(screen.queryByRole("textbox", { name: "Uzasadnij pierwszy rozstrzygający krok" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Iloczyn nad pierwszym ułamkiem" })).toBeInTheDocument();
  });

  it("utrwala kontrakty dotyku, focus, obu orientacji, reduced motion i druku", () => {
    const css = readFileSync(resolve(process.cwd(), "src/components/lessons/fractions/fractionComparisonLesson.module.css"), "utf8");
    expect(css).toContain("min-width: 44px");
    expect(css).toContain("min-height: 44px");
    expect(css).toContain(":focus-visible");
    expect(css).toContain("@media (orientation: portrait)");
    expect(css).toContain("@media (orientation: landscape)");
    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
    expect(css).toContain("@media print");
  });
});
