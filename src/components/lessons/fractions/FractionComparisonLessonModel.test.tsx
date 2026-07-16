/** @vitest-environment jsdom */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FractionComparisonLessonModel } from "@/components/lessons/fractions/FractionComparisonLessonModel";
import { FractionLessonL1Model } from "@/components/lessons/fractions/FractionLessonL1Model";
import { createPublicFractionComparisonTask } from "@/lib/math/fractions/fractionComparisonLesson";

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

  it("animuje dwa skosy i zapisuje iloczyny nad właściwymi licznikami", () => {
    const { container } = render(<FractionComparisonLessonModel activity="cross-multiplication" seed={34043} />);
    expect(container.querySelector("[data-cross-product='left']")).toHaveTextContent("?");
    fireEvent.click(screen.getByRole("button", { name: "1 × 3 = 3" }));
    expect(container.querySelector("[data-cross-product='left']")).toHaveTextContent("3");
    expect(container.querySelector("[data-cross-operand='left-numerator']")).toHaveAttribute("data-cross-highlight", "cyan");
    expect(container.querySelector("[data-cross-operand='right-denominator']")).toHaveAttribute("data-cross-highlight", "cyan");
    fireEvent.click(screen.getByRole("button", { name: "2 × 2 = 4" }));
    expect(container.querySelector("[data-cross-product='right']")).toHaveTextContent("4");
    expect(container.querySelector("[data-cross-operand='right-numerator']")).toHaveAttribute("data-cross-highlight", "violet");
    expect(container.querySelector("[data-cross-operand='left-denominator']")).toHaveAttribute("data-cross-highlight", "violet");
    expect(screen.getByLabelText("trzy jest mniejsze od czterech")).toHaveTextContent("<");
    expect(screen.getByText(/3 < 4/u)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Pokaż mnożenie po skosie" }));
    expect(screen.getByText("3 × 7 = 21")).toBeInTheDocument();
    expect(screen.getByText("4 × 5 = 20")).toBeInTheDocument();
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

  it("pokazuje pułapkę 1/8 i 1/6 oraz podświetla pierwszy rozstrzygający mianownik nie tylko kolorem", () => {
    const { container } = render(<FractionComparisonLessonModel activity="denominator-trap" seed={34044} />);
    const decisive = container.querySelectorAll("[data-decisive-member='true']");
    expect(decisive.length).toBeGreaterThanOrEqual(2);
    expect(decisive[0]?.className).toContain("decisive");
    expect(screen.getByText(/Większy mianownik dzieli tę samą całość/u)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Wstaw znak <" }));
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź kontrprzykład" }));
    expect(screen.getByRole("status")).toHaveTextContent(/Znak jest poprawny/u);
  });

  it("pozwala wybrać najkrótszą strategię i pokazuje wspólny pionowy mianownik", () => {
    const { container } = render(<FractionComparisonLessonModel activity="shortest-strategy" seed={34043} />);
    fireEvent.click(screen.getByRole("button", { name: /Wspólny mianownik/u }));
    expect(container.querySelector("[data-strategy-evidence='common-denominator']")).toBeInTheDocument();
    expect(container.querySelectorAll("[data-decisive-member='true']")).toHaveLength(2);
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź najkrótszą strategię" }));
    expect(screen.getByRole("status")).toHaveTextContent(/bez zbędnych kroków/u);
  });

  it("porządkuje drony i wymaga uzasadnienia pierwszego rozstrzygającego kroku", () => {
    const onResultChange = vi.fn();
    render(<FractionComparisonLessonModel activity="drone-race" seed={34045} onResultChange={onResultChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Przesuń 5/8 w prawo" }));
    fireEvent.click(screen.getByRole("button", { name: "Przesuń 5/8 w prawo" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Uzasadnij pierwszy rozstrzygający krok" }), { target: { value: "1/2 jest punktem odniesienia, a pozostałe punkty leżą dalej na prawo." } });
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź kolejność dronów" }));
    expect(onResultChange).toHaveBeenLastCalledWith(true, expect.stringContaining("1/2 < 4/7 < 5/8"));
  });

  it("lokalny adapter prowadzi samodzielną próbę M5-3.4 do własnego generatora", () => {
    const onResultChange = vi.fn();
    const task = createPublicFractionComparisonTask({ seed: 34402, difficulty: "core", activity: "independent-comparison" });
    const { container } = render(<FractionLessonL1Model activity="independent-comparison" seed={34402} difficulty="core" onResultChange={onResultChange} />);
    expect(container.querySelector("[data-fraction-comparison-l1][data-generator-id='fraction-comparison-l1-v1']")).toBeInTheDocument();
    expect(container.querySelector("[data-answer-spec='server-only']")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: new RegExp(task.recommendedStrategy === "common-denominator" ? "Wspólny mianownik" : task.recommendedStrategy === "common-numerator" ? "Wspólny licznik" : task.recommendedStrategy === "reference-half" ? "Odniesienie do 1/2" : "Odniesienie do 1", "u") }));
    fireEvent.click(screen.getByRole("button", { name: new RegExp(`Przesuń ${task.fractions[2]!.numerator}/${task.fractions[2]!.denominator} w prawo`, "u") }));
    fireEvent.click(screen.getByRole("button", { name: new RegExp(`Przesuń ${task.fractions[2]!.numerator}/${task.fractions[2]!.denominator} w prawo`, "u") }));
    const reason = task.recommendedStrategy === "common-denominator"
      ? "Wspólny mianownik pokazuje pierwsze różne liczniki."
      : task.recommendedStrategy === "common-numerator"
        ? "Wspólny licznik pokazuje różne rozmiary części."
        : task.recommendedStrategy === "reference-half"
          ? "Porównuję każdy punkt z 1/2 i połową całości."
          : "Porównuję każdy punkt z 1 i jedną całością.";
    fireEvent.change(screen.getByRole("textbox", { name: "Uzasadnij pierwszy rozstrzygający krok" }), { target: { value: reason } });
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź samodzielną próbę" }));
    expect(onResultChange).toHaveBeenLastCalledWith(true, expect.any(String));
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
