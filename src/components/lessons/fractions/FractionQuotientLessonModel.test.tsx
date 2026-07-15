/** @vitest-environment jsdom */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FractionLessonL1Model } from "@/components/lessons/fractions/FractionLessonL1Model";
import { FractionQuotientLessonModel } from "@/components/lessons/fractions/FractionQuotientLessonModel";

afterEach(cleanup);

function placePiece(container: HTMLElement, pieceIndex: number, personNumber: 1 | 2) {
  const piece = container.querySelector(`[data-share-piece='${pieceIndex}']`)!;
  fireEvent.click(piece);
  fireEvent.click(screen.getByRole("button", { name: `Umieść wybrany kawałek u osoby ${personNumber}` }));
}

describe("FractionQuotientLessonModel — podział, zapis, realtime i dostępność", () => {
  it("udostępnia wybierz–umieść, zachowuje 10 połówek i diagnozuje niewykorzystane części", () => {
    const { container } = render(<FractionQuotientLessonModel activity="fair-share" seed={32021} />);
    expect(screen.getAllByRole("img", { name: /Placek \d z 5/u })).toHaveLength(5);
    fireEvent.click(screen.getByRole("button", { name: "Pokrój 5 placków na połówki" }));
    expect(container.querySelectorAll("[data-share-piece]")).toHaveLength(10);
    placePiece(container, 0, 1);
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź sprawiedliwy podział" }));
    expect(screen.getAllByText(/Część podzielonych obiektów pozostała/u).length).toBeGreaterThan(0);
  });

  it("odróżnia nierówny podział od poprawnych pięciu połówek dla każdej osoby", () => {
    const { container } = render(<FractionQuotientLessonModel activity="fair-share" seed={32021} />);
    fireEvent.click(screen.getByRole("button", { name: "Pokrój 5 placków na połówki" }));
    for (let index = 0; index < 10; index += 1) placePiece(container, index, index < 6 ? 1 : 2);
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź sprawiedliwy podział" }));
    expect(screen.getAllByText(/osoby otrzymały różne liczby/u).length).toBeGreaterThan(0);
    placePiece(container, 5, 2);
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź sprawiedliwy podział" }));
    expect(screen.getByRole("status")).toHaveTextContent("Każda osoba otrzymała 5 połówek");
  });

  it("animuje przejście 5:2 do 5/2, nazywa role i diagnozuje odwróconą kolejność", () => {
    render(<FractionQuotientLessonModel activity="two-notations" seed={32022} />);
    fireEvent.click(screen.getByRole("button", { name: "Pokaż następny krok →" }));
    expect(screen.getByText("5: dzielna → licznik")).toBeInTheDocument();
    expect(screen.getByText("2: dzielnik → mianownik")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("licznik, cyfra 1 z 1"), { target: { value: "2" } });
    fireEvent.change(screen.getByLabelText("mianownik, cyfra 1 z 1"), { target: { value: "5" } });
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź kolejność liczb" }));
    expect(screen.getAllByText(/Kolejność dzielnej i dzielnika/u).length).toBeGreaterThan(0);
  });

  it("aktualizuje liczbę obiektów, osób, ułamek i model w czasie rzeczywistym", () => {
    const { container } = render(<FractionQuotientLessonModel activity="realtime-quotient" seed={32023} />);
    fireEvent.change(screen.getByLabelText("Liczba obiektów"), { target: { value: "8" } });
    fireEvent.change(screen.getByLabelText("Liczba osób"), { target: { value: "3" } });
    expect(screen.getByLabelText("8 podzielić przez 3 równa się 8/3")).toBeInTheDocument();
    expect(container.querySelectorAll("[data-fraction-circle]")).toHaveLength(3);
    expect(screen.getByText("Jedna osoba dostaje 2 2/3 całości.")).toBeInTheDocument();
  });

  it("pokazuje 5:0 bez niepoprawnego ułamka i jasną diagnozę warunku", () => {
    render(<FractionQuotientLessonModel activity="zero-divisor" seed={32024} />);
    expect(screen.getByText(/dzielnik i mianownik muszą być większe od 0/u)).toBeInTheDocument();
    expect(screen.getByText("brak ilorazu")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź warunek" }));
    expect(screen.getByText("Na zero części nie można podzielić całości.")).toBeInTheDocument();
  });

  it("lokalny adapter prowadzi Samodzielną próbę do 13:6 i wymaga kontekstu", () => {
    const onResultChange = vi.fn();
    const { container } = render(<FractionLessonL1Model activity="independent-context" seed={32302} onResultChange={onResultChange} />);
    expect(container.querySelector("[data-fraction-quotient-lesson]")).toBeInTheDocument();
    expect(container.querySelector("[data-orientation-contract='portrait-landscape']")).toBeInTheDocument();
    expect(screen.getByLabelText("13 podzielić przez 6 równa się 13/6")).toBeInTheDocument();
    expect(screen.getByLabelText("Co dzielisz?")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sprawdź zapis i interpretację" })).toBeInTheDocument();
  });

  it("utrwala kontrakty dotyku, orientacji, reduced motion i druku", () => {
    const css = readFileSync(resolve(process.cwd(), "src/components/lessons/fractions/fractionQuotientLesson.module.css"), "utf8");
    expect(css).toContain("min-width: 44px");
    expect(css).toContain("min-height: 44px");
    expect(css).toContain("@media (orientation: portrait) and (max-width: 1024px)");
    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
    expect(css).toContain("@media print");
  });
});
