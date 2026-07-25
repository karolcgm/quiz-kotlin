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
});
