/** @vitest-environment jsdom */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FractionLessonL1Model } from "@/components/lessons/fractions/FractionLessonL1Model";
import { FractionSameDenominatorLessonModel } from "@/components/lessons/fractions/FractionSameDenominatorLessonModel";

afterEach(cleanup);

describe("FractionSameDenominatorLessonModel — zapis pionowy, ruch i diagnostyka", () => {
  it("przenosi trzy kawałki pizzy i aktualizuje 2/8 + 3/8 do 5/8 w czasie rzeczywistym", () => {
    const { container } = render(<FractionSameDenominatorLessonModel activity="same-denom-pizza-add" seed={35051} />);
    const move = screen.getByRole("button", { name: "Przenieś jeden kawałek" });
    fireEvent.click(move);
    fireEvent.click(move);
    fireEvent.click(move);
    expect(screen.getByRole("status")).toHaveTextContent("2/8 + 3/8 = 5/8");
    expect(container.querySelector("[data-common-denominator-outline]")).toBeInTheDocument();
    expect(container.querySelector("[data-connector-from='same-denom-left-numerator'][data-connector-to='same-denom-right-numerator']")).toBeInTheDocument();
    expect(container.querySelector("[data-connector-from*='denominator']")).not.toBeInTheDocument();
  });

  it("odsłania regułę etapami: najpierw obrys mianowników, potem łącznik tylko liczników, na końcu wynik", () => {
    const { container } = render(<FractionSameDenominatorLessonModel activity="same-denom-rule" seed={35052} />);
    expect(container.querySelector("[data-common-denominator-outline]")).toBeInTheDocument();
    expect(container.querySelector("[data-connector-from]")).not.toBeInTheDocument();
    expect(screen.getByLabelText("wynik ukryty do próby")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Następny krok →" }));
    expect(container.querySelector("[data-connector-from='same-denom-left-numerator']")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Następny krok →" }));
    expect(screen.queryByLabelText("wynik ukryty do próby")).not.toBeInTheDocument();
  });

  it("nie pokazuje pola wyniku odejmowania przed fizycznym odłożeniem trzech kawałków", () => {
    render(<FractionSameDenominatorLessonModel activity="same-denom-take-away" seed={35053} />);
    expect(screen.queryByLabelText("Wynik działania w pionowych kratkach ułamka")).not.toBeInTheDocument();
    const remove = screen.getByRole("button", { name: "Odłóż jeden kawałek" });
    fireEvent.click(remove);
    fireEvent.click(remove);
    expect(screen.queryByLabelText("Wynik działania w pionowych kratkach ułamka")).not.toBeInTheDocument();
    fireEvent.click(remove);
    expect(screen.getByLabelText("Wynik działania w pionowych kratkach ułamka")).toBeInTheDocument();
  });

  it("diagnozuje poprawną wartość pozostawioną bez skrócenia i zostawia ślad przekreślenia", () => {
    const onResultChange = vi.fn();
    const { container } = render(<FractionLessonL1Model activity="same-denom-independent" seed={35501} difficulty="support" onResultChange={onResultChange} />);
    expect(container.querySelector("[data-fraction-same-denominator-l1][data-generator-id='fraction-same-denominator-l1-v1']")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/licznik, cyfra 1/u), { target: { value: "4" } });
    fireEvent.change(screen.getByLabelText(/mianownik, cyfra 1/u), { target: { value: "8" } });
    fireEvent.change(screen.getByRole("textbox", { name: "Dlaczego mianownik działania się nie zmienia?" }), { target: { value: "Mianownik zostaje taki sam, bo nadal liczymy ósme części tej samej wielkości." } });
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź wynik i uzasadnienie" }));
    expect(onResultChange).toHaveBeenLastCalledWith(false, expect.stringContaining("4/8"));
    expect(container.querySelector("[data-cross-out-trace]")).toBeInTheDocument();
    expect(screen.getAllByText(/końcowy ułamek można jeszcze skrócić/u).length).toBeGreaterThan(0);
  });

  it("utrwala dotyk, klawiaturę, obie orientacje, reduced motion i druk", () => {
    const css = readFileSync(resolve(process.cwd(), "src/components/lessons/fractions/fractionSameDenominatorLesson.module.css"), "utf8");
    expect(css).toContain("min-width: 48px");
    expect(css).toContain("min-height: 48px");
    expect(css).toContain(":focus-visible");
    expect(css).toContain("@media (orientation: portrait)");
    expect(css).toContain("@media (orientation: landscape)");
    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
    expect(css).toContain("@media print");
  });
});
