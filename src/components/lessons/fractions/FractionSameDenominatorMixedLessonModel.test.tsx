/** @vitest-environment jsdom */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FractionLessonL1Model } from "@/components/lessons/fractions/FractionLessonL1Model";
import { FractionSameDenominatorMixedLessonModel } from "@/components/lessons/fractions/FractionSameDenominatorMixedLessonModel";

afterEach(cleanup);

describe("FractionSameDenominatorMixedLessonModel — zamiana całości i zapis pionowy", () => {
  it("blokuje odejmowanie do pocięcia pełnej pizzy na osiem części i zamiany całości", () => {
    const { container } = render(<FractionSameDenominatorMixedLessonModel activity="mixed-same-denom-borrow-pizza" seed={350562} />);
    fireEvent.click(screen.getByRole("button", { name: "Spróbuj odjąć bez zamiany" }));
    expect(screen.getAllByText(/za mało równych części/u).length).toBeGreaterThan(0);

    const cut = screen.getByRole("button", { name: "Potnij kolejną ósmą część" });
    for (let index = 0; index < 8; index += 1) fireEvent.click(cut);
    expect(container.querySelector("[data-cut-count='8']")).toBeInTheDocument();
    const exchange = screen.getByRole("button", { name: "Zamień pociętą całość na 8/8" });
    expect(exchange).toBeEnabled();
    fireEvent.click(exchange);
    expect(container.querySelector("[data-new-whole-value]")).toHaveTextContent("3");
    expect(container.querySelector("[data-new-numerator-value]")).toHaveTextContent("11");

    const subtract = screen.getByRole("button", { name: "Odejmij jedną ósmą" });
    for (let index = 0; index < 5; index += 1) fireEvent.click(subtract);
    expect(screen.getByText(/zostało 2 6\/8, czyli 2 3\/4/u)).toBeInTheDocument();
  });

  it("zostawia stare 4 i 3 przekreślone oraz pokazuje nowe wartości w małych kratkach", () => {
    const { container } = render(<FractionSameDenominatorMixedLessonModel activity="mixed-same-denom-borrow-notation" seed={350563} />);
    const next = screen.getByRole("button", { name: "Następny krok →" });
    fireEvent.click(next);
    fireEvent.click(next);
    expect(container.querySelectorAll("[data-operation-member='mixed-left'] [class*='crossedCell']")).toHaveLength(2);
    expect(container.querySelector("[data-new-whole-value]")).toHaveTextContent("3");
    expect(container.querySelector("[data-new-numerator-value]")).toHaveTextContent("11");
    expect(screen.getByText(/1 całość = 8\/8/u)).toBeInTheDocument();
  });

  it("przyjmuje nieskróconą wartość częściowo i pokazuje ślad korekty", () => {
    const onResultChange = vi.fn();
    const { container } = render(<FractionLessonL1Model activity="mixed-same-denom-independent" seed={35520} difficulty="support" onResultChange={onResultChange} />);
    expect(container.querySelector("[data-fraction-same-denominator-mixed-l2][data-answer-spec='server-only']")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/część całkowita, cyfra 1/u), { target: { value: "3" } });
    fireEvent.change(screen.getByLabelText(/licznik, cyfra 1/u), { target: { value: "4" } });
    fireEvent.change(screen.getByLabelText(/mianownik, cyfra 1/u), { target: { value: "6" } });
    fireEvent.change(screen.getByRole("textbox", { name: "Uzasadnij kluczowy krok jednym zdaniem" }), { target: { value: "Mianownik zostaje taki sam, bo dodaję jednakowe szóste części." } });
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź wynik i zapis kroków" }));
    expect(onResultChange).toHaveBeenLastCalledWith(false, expect.stringContaining("3 4/6"));
    expect(container.querySelector("[data-cross-out-trace]")).toBeInTheDocument();
    expect(screen.getAllByText(/część ułamkową można jeszcze skrócić/u).length).toBeGreaterThan(0);
  });

  it("utrwala dotyk, klawiaturę, orientacje, reduced motion i druk", () => {
    const css = readFileSync(resolve(process.cwd(), "src/components/lessons/fractions/fractionSameDenominatorMixedLesson.module.css"), "utf8");
    expect(css).toContain("min-height: 48px");
    expect(css).toContain(":focus-visible");
    expect(css).toContain("@media (orientation: landscape)");
    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
    expect(css).toContain("@media print");
  });
});
