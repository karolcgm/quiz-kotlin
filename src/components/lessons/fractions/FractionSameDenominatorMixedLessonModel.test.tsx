/** @vitest-environment jsdom */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
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
    const exchange = screen.getByRole("button", { name: "Zamień pociętą całość na osiem ósmych" });
    expect(exchange).toBeEnabled();
    fireEvent.click(exchange);
    expect(screen.getByText(/Zamiana jest gotowa/u)).toBeInTheDocument();
    expect(container.querySelector("[data-operation-member='answer-left']")).toBeInTheDocument();
    expect(screen.queryByText(/Dopiero teraz odejmij/u)).not.toBeInTheDocument();
  });

  it("zostawia stare 4 i 3 przekreślone oraz pokazuje nowe wartości w małych kratkach", () => {
    const { container } = render(<FractionSameDenominatorMixedLessonModel activity="mixed-same-denom-borrow-notation" seed={350563} />);
    const next = screen.getByRole("button", { name: "Następny krok →" });
    fireEvent.click(next);
    fireEvent.click(next);
    expect(container.querySelectorAll("[data-operation-member='mixed-left'] [class*='crossedCell']")).toHaveLength(2);
    expect(container.querySelector("[data-new-whole-value]")).toHaveTextContent("3");
    expect(container.querySelector("[data-new-numerator-value]")).toHaveTextContent("11");
    expect(container.querySelector("[data-operation-member='exchange-whole'] [class*='fractionCell']")).toHaveTextContent("8");
  });

  it("przyjmuje nieskróconą wartość częściowo i pokazuje ślad korekty", () => {
    const onResultChange = vi.fn();
    const { container } = render(<FractionLessonL1Model activity="mixed-same-denom-independent" seed={35520} difficulty="support" onResultChange={onResultChange} />);
    expect(container.querySelector("[data-fraction-same-denominator-mixed-l2][data-answer-spec='server-only']")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/część całkowita, cyfra 1/u), { target: { value: "3" } });
    fireEvent.change(screen.getByLabelText(/licznik, cyfra 1/u), { target: { value: "4" } });
    fireEvent.change(screen.getByLabelText(/mianownik, cyfra 1/u), { target: { value: "6" } });
    fireEvent.change(screen.getByRole("textbox", { name: "Uzasadnij kluczowy krok jednym zdaniem" }), { target: { value: "Mianownik zostaje taki sam, bo dodaję jednakowe szóste części." } });
    fireEvent.click(screen.getByRole("button", { name: "Prześlij zadanie" }));
    expect(onResultChange).toHaveBeenLastCalledWith(false, expect.stringContaining("3 4/6"));
    expect(container.querySelector("[data-cross-out-trace]")).toBeInTheDocument();
    expect(screen.getAllByText(/część ułamkową można jeszcze skrócić/u).length).toBeGreaterThan(0);
  });

  it("po kliknięciu zamiany pokazuje aktywne kratki i wymaga wpisania nowej liczby mieszanej", () => {
    const { container } = render(
      <FractionSameDenominatorMixedLessonModel
        activity="mixed-same-denom-independent"
        seed={35523}
        difficulty="core"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Zamień jedną całość w zapisie" }));
    const exchangeEntry = container.querySelector<HTMLElement>("[data-exchange-entry]");
    expect(exchangeEntry).toBeInTheDocument();
    const fullOperation = container.querySelector<HTMLElement>("[data-full-mixed-operation]");
    expect(fullOperation).toBeInTheDocument();
    expect(fullOperation).toContainElement(exchangeEntry);
    expect(within(fullOperation!).getAllByText("=")).toHaveLength(2);
    expect(within(exchangeEntry!).getByLabelText(/część całkowita, cyfra 1/u)).toBeEnabled();
    expect(container.querySelectorAll("[data-fraction-keypad]")).toHaveLength(1);

    const keypad = screen.getByLabelText("Klawiatura ekranowa do ułamków");
    for (const digit of ["4", "9", "8"]) {
      fireEvent.click(within(keypad).getByRole("button", { name: digit }));
    }
    fireEvent.click(within(keypad).getByRole("button", { name: "Zatwierdź" }));

    expect(screen.getByText(/Zamiana jest poprawna/u)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Prześlij zadanie" })).toBeInTheDocument();
    expect(container.querySelectorAll("[data-fraction-keypad]")).toHaveLength(1);
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
