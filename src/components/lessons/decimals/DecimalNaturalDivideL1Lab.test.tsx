/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DecimalNaturalDivideL1Lab } from "@/components/lessons/decimals/DecimalNaturalDivideL1Lab";

afterEach(cleanup);

describe("DecimalNaturalDivideL1Lab", () => {
  it("pokazuje zasadę przecinka i dopisywanie zera w dzieleniu pisemnym", () => {
    const { container } = render(<DecimalNaturalDivideL1Lab activity="decimal-natural-divide-written" seed={559200} />);
    expect(screen.getByText(/Przecinek w ilorazie zapisujemy dokładnie nad przecinkiem/u)).toBeInTheDocument();
    expect(screen.getByText(/Gdy po przecinku zabraknie cyfry, dopisujemy 0 do dzielnej/u)).toBeInTheDocument();
    expect(screen.getByText(/Nie zostawiamy reszty/u)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Dopisz 0" })).toBeInTheDocument();
    const writtenDivision = container.querySelector("[data-decimal-long-division]");
    expect(writtenDivision?.querySelectorAll("[data-decimal-comma]")).toHaveLength(2);
    expect(writtenDivision).toHaveAttribute("aria-label", expect.stringContaining("4,2"));
    expect(writtenDivision?.querySelectorAll("[data-answer-cell]").length).toBeGreaterThan(5);
    const columnLayouts = new Set(Array.from(writtenDivision?.querySelectorAll<HTMLElement>("[data-division-grid-row]") ?? []).map((row) => row.style.gridTemplateColumns));
    expect(columnLayouts.size).toBe(1);
  });

  it("wymaga dopisania zer, kroków pisemnych i kompletnego ilorazu", () => {
    const onResultChange = vi.fn();
    render(<DecimalNaturalDivideL1Lab activity="decimal-natural-divide-written" seed={559200} onResultChange={onResultChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Dopisz 0" }));
    fireEvent.click(screen.getByRole("button", { name: "Dopisz 0" }));
    const fillStep = (label: RegExp, digits: string[]) => {
      fireEvent.click(screen.getByRole("button", { name: label }));
      for (const digit of digits) fireEvent.click(screen.getByRole("button", { name: digit }));
    };
    fillStep(/Iloczyn do odjęcia, krok 1, cyfra 1/u, ["4", "0"]);
    fillStep(/Liczba po sprowadzeniu, krok 1, cyfra 1/u, ["2", "0"]);
    fillStep(/Iloczyn do odjęcia, krok 2, cyfra 1/u, ["1", "6"]);
    fillStep(/Liczba po sprowadzeniu, krok 2, cyfra 1/u, ["4", "0"]);
    fillStep(/Iloczyn do odjęcia, krok 3, cyfra 1/u, ["4", "0"]);
    fillStep(/Liczba po sprowadzeniu, krok 3, cyfra 1/u, ["0"]);
    fireEvent.click(screen.getByRole("button", { name: "Iloraz, cyfra 1" }));
    for (const digit of ["0", "5", "2", "5"]) fireEvent.click(screen.getByRole("button", { name: digit }));
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
    expect(onResultChange).toHaveBeenLastCalledWith(true, "0,525");
  });

  it("pokazuje zadanie tekstowe z ilustracją i polem na odpowiedź", () => {
    const { container } = render(<DecimalNaturalDivideL1Lab activity="decimal-natural-divide-story" seed={559300} />);
    expect(screen.getByText(/jednakowych butelek/u)).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /Butelki z sokiem/u })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Odpowiedź: l/u })).toBeInTheDocument();
    expect(container.querySelector("[data-decimal-long-division]")?.querySelectorAll("[data-decimal-comma]")).toHaveLength(2);
  });
});
