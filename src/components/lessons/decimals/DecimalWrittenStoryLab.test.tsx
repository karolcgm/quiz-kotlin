/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { DecimalWrittenStoryLab } from "@/components/lessons/decimals/DecimalWrittenStoryLab";

afterEach(cleanup);

describe("DecimalWrittenStoryLab", () => {
  it("zachowuje pozycję cyfry wpisanej najpierw w ostatniej kratce wyniku", () => {
    render(<DecimalWrittenStoryLab activity="decimal-written-story" seed={558300} />);
    fireEvent.click(screen.getByRole("button", { name: "+" }));
    const lastResultCell = screen.getByRole("button", { name: "Wynik działania, cyfra 4" });
    fireEvent.click(lastResultCell);
    fireEvent.click(screen.getByRole("button", { name: "3" }));
    expect(lastResultCell).toHaveTextContent("3");
    expect(screen.getByRole("button", { name: "Wynik działania, cyfra 1" })).not.toHaveTextContent("3");
  });

  it("w trzecim zadaniu pokazuje kratki pomocnicze i pełny rząd wyniku mnożenia", () => {
    render(<DecimalWrittenStoryLab activity="decimal-written-story" seed={558302} questionNumber={3} questionCount={4} />);

    fireEvent.click(screen.getByRole("button", { name: "·" }));

    expect(screen.getByRole("button", { name: "Mała kratka 1 nad działaniem" })).toHaveTextContent("");
    expect(screen.getByRole("button", { name: "Mała kratka 2 nad działaniem" })).toHaveTextContent("");
    expect(screen.getByRole("button", { name: "Wynik działania, cyfra 1" })).toHaveTextContent("");
    expect(screen.getByRole("button", { name: "Wynik działania, cyfra 4" })).toHaveTextContent("");
  });

  it("w czwartym zadaniu używa schodkowego modelu dzielenia pisemnego", () => {
    const { container } = render(<DecimalWrittenStoryLab activity="decimal-written-story" seed={558303} questionNumber={4} questionCount={4} />);

    fireEvent.click(screen.getByRole("button", { name: ":" }));
    [
      ["Dzielna, cyfra 1", "1"],
      ["Dzielna, cyfra 2", "3"],
      ["Dzielna, cyfra 3", "5"],
      ["Dzielnik, cyfra 1", "0"],
      ["Dzielnik, cyfra 2", "7"],
      ["Dzielnik, cyfra 3", "5"],
    ].forEach(([cell, digit]) => {
      fireEvent.click(screen.getByRole("button", { name: cell }));
      fireEvent.click(screen.getByRole("button", { name: digit }));
    });

    const shiftButton = screen.getByRole("button", { name: /Przesuń oba przecinki o 1 miejsce/u });
    fireEvent.click(shiftButton);
    fireEvent.click(shiftButton);

    expect(screen.getByLabelText("Dzielenie pisemne 1350 przez 75")).toBeInTheDocument();
    expect(container.querySelector("[data-decimal-long-division]")).toBeInTheDocument();

    const rows = [...container.querySelectorAll<HTMLElement>("[data-division-grid-row]")];
    expect(rows.length).toBeGreaterThan(5);
    expect(new Set(rows.map((row) => row.style.gridTemplateColumns)).size).toBe(1);

    const firstProduct = screen.getByRole("button", { name: "Iloczyn do odjęcia, krok 1, cyfra 1" });
    const finalRemainder = screen.getByRole("button", { name: "Liczba po sprowadzeniu, krok 2, cyfra 1" });
    expect(Number(finalRemainder.style.gridColumnStart)).toBeGreaterThan(Number(firstProduct.style.gridColumnStart));
  });
});
