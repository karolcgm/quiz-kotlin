/** @vitest-environment jsdom */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FractionEquivalenceLessonModel } from "@/components/lessons/fractions/FractionEquivalenceLessonModel";
import { FractionLessonL1Model } from "@/components/lessons/fractions/FractionLessonL1Model";

afterEach(cleanup);

function fillFraction(numerator: string, denominator: string) {
  const fraction = screen.getByRole("region", { name: "Zapis ułamka w kratkach" });
  numerator.split("").forEach((digit, index) => {
    fireEvent.change(fraction.querySelectorAll<HTMLInputElement>("[data-fraction-part='numerator']")[index]!, { target: { value: digit } });
  });
  denominator.split("").forEach((digit, index) => {
    fireEvent.change(fraction.querySelectorAll<HTMLInputElement>("[data-fraction-part='denominator']")[index]!, { target: { value: digit } });
  });
}

describe("FractionEquivalenceLessonModel — pionowy zapis, pary, modele i dostępność", () => {
  it("zagęszcza podział 3/7 w czasie rzeczywistym bez przesunięcia wartości", () => {
    const { container } = render(<FractionEquivalenceLessonModel activity="denser-partition" seed={33031} />);
    fireEvent.click(screen.getByRole("button", { name: "Każdy segment × 4" }));
    expect(container.querySelector("[data-density-multiplier='4']")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("3/7 = 12/28");
    expect(container.querySelector("[data-equivalent-axis][data-value-preserved='true']")).toBeInTheDocument();
    expect(container.querySelector("[data-axis-fraction='3/7'] circle")).toHaveAttribute("cx", container.querySelector("[data-axis-fraction='12/28'] circle")?.getAttribute("cx"));
    expect(container.querySelector("[data-equivalent-area-interpretation]")).toBeInTheDocument();
  });

  it("rozszerza do wskazanej liczby w jednej serii bez zdublowanej nawigacji", () => {
    const { container } = render(<FractionEquivalenceLessonModel activity="expansion-grid" seed={33032} />);
    expect(screen.getAllByText("Zadanie 1/4")).toHaveLength(1);
    expect(container.querySelector("[data-lesson-task-navigator]")).not.toBeInTheDocument();
    expect(screen.getByLabelText("mianownik, cyfra 1 z 2")).toHaveValue("5");
    expect(screen.getByLabelText("mianownik, cyfra 1 z 2")).toHaveAttribute("readonly");
    expect(screen.getByLabelText("licznik, cyfra 1 z 2")).toHaveAttribute("readonly");
    fireEvent.click(screen.getByLabelText("licznik, cyfra 1 z 2"));
    fireEvent.click(screen.getByRole("button", { name: "4" }));
    fireEvent.click(screen.getByRole("button", { name: "0" }));
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByRole("status")).toHaveTextContent("Otwieram następne zadanie");
    expect(screen.getByText("Zadanie 2/4")).toBeInTheDocument();
  });

  it("skraca 3/6 w jednej linii, bez dodatkowych pasków i osi", () => {
    const { container } = render(<FractionEquivalenceLessonModel activity="cross-out-rewrite" seed={33034} />);
    expect(container.querySelector("[data-equivalent-axis]")).not.toBeInTheDocument();
    expect(container.textContent).not.toContain("before-numerator");
    expect(container.textContent).not.toContain("before-denominator");
    expect(container.querySelectorAll("[data-fraction-bar]")).toHaveLength(0);
    fireEvent.click(screen.getByRole("button", { name: "÷ 3" }));
    fillFraction("1", "2");
    fireEvent.click(screen.getByRole("button", { name: "Prześlij zadanie" }));
    expect(screen.getByRole("status")).toHaveTextContent("licznik i mianownik podzielono przez ten sam wspólny dzielnik");
  });

  it("lokalny adapter prowadzi samodzielną próbę do generatora M5-3.3 i zgłasza działanie jednostronne", () => {
    const onResultChange = vi.fn();
    const { container } = render(<FractionLessonL1Model activity="independent-equivalence" seed={33301} onResultChange={onResultChange} />);
    expect(container.querySelector("[data-fraction-equivalence-lesson][data-generator-id='fraction-equivalence-l1-v1']")).toBeInTheDocument();
    expect(container.querySelector("[data-orientation-contract='portrait-landscape']")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Mnożnik licznika w samodzielnej próbie"), { target: { value: "1" } });
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź całą samodzielną próbę" }));
    expect(onResultChange).toHaveBeenLastCalledWith(false, expect.any(String));
  });

  it("obsługuje kilka poprawnych kroków w samodzielnej próbie i zwraca wynik do Live", () => {
    const onResultChange = vi.fn();
    render(<FractionEquivalenceLessonModel activity="independent-equivalence" seed={33301} difficulty="support" onResultChange={onResultChange} />);
    const prompt = screen.getByText(/rozszerz przez/u).textContent ?? "";
    const source = screen.getByLabelText(/ułamek początkowy:/u).getAttribute("aria-label") ?? "";
    const factor = Number(prompt.match(/rozszerz przez (\d+)/u)?.[1]);
    const [, numeratorText, denominatorText] = source.match(/(\d+)\/(\d+)/u) ?? [];
    const numerator = Number(numeratorText);
    const denominator = Number(denominatorText);
    const expandedNumerator = numerator * factor;
    const expandedDenominator = denominator * factor;
    const expansionSection = screen.getByRole("heading", { name: "1. Rozszerzenie" }).closest("section")!;
    const finalSection = screen.getByRole("heading", { name: "3. Postać nieskracalna" }).closest("section")!;
    const numeratorDigits = String(expandedNumerator).split("");
    const denominatorDigits = String(expandedDenominator).split("");
    numeratorDigits.forEach((digit, index) => {
      const cells = expansionSection.querySelectorAll<HTMLInputElement>("[data-fraction-part='numerator']");
      fireEvent.change(cells[index]!, { target: { value: digit } });
    });
    denominatorDigits.forEach((digit, index) => {
      const cells = expansionSection.querySelectorAll<HTMLInputElement>("[data-fraction-part='denominator']");
      fireEvent.change(cells[index]!, { target: { value: digit } });
    });
    fireEvent.change(screen.getByLabelText("Ścieżka dzielników licznika"), { target: { value: String(factor) } });
    fireEvent.change(screen.getByLabelText("Ścieżka dzielników mianownika"), { target: { value: String(factor) } });
    fireEvent.change(finalSection.querySelector<HTMLInputElement>("[data-fraction-part='numerator']")!, { target: { value: String(numerator) } });
    fireEvent.change(finalSection.querySelector<HTMLInputElement>("[data-fraction-part='denominator']")!, { target: { value: String(denominator) } });
    fireEvent.change(screen.getByRole("textbox", { name: "Dlaczego wartość się nie zmieniła?" }), { target: { value: "Licznik i mianownik zmieniono przez tę samą liczbę, więc punkt osi pozostał." } });
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź całą samodzielną próbę" }));
    expect(onResultChange).toHaveBeenLastCalledWith(true, expect.stringContaining("→"));
  });

  it("L2 rozpoczyna od skracania i nie powtarza etapu rozszerzania z L1", () => {
    render(<FractionEquivalenceLessonModel activity="independent-simplification" seed={533215} difficulty="challenge" />);
    expect(screen.getByText(/skróć do postaci nieskracalnej/u)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "1. Ścieżka skracania" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "1. Rozszerzenie" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sprawdź skracanie" })).toBeInTheDocument();
  });

  it("utrwala kontrakty dotyku, focus, obu orientacji, reduced motion i druku", () => {
    const css = readFileSync(resolve(process.cwd(), "src/components/lessons/fractions/fractionEquivalenceLesson.module.css"), "utf8");
    expect(css).toContain("min-width: 44px");
    expect(css).toContain("min-height: 44px");
    expect(css).toContain(":focus-visible");
    expect(css).toContain("@media (orientation: portrait)");
    expect(css).toContain("@media (orientation: landscape)");
    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
    expect(css).toContain("@media print");
  });
});
