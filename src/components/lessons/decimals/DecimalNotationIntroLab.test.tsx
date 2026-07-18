// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DecimalNotationIntroLab } from "@/components/lessons/decimals/DecimalNotationIntroLab";

function press(keypad: HTMLElement, value: string) {
  fireEvent.click(within(keypad).getByRole("button", { name: value }));
}

afterEach(cleanup);

describe("DecimalNotationIntroLab", () => {
  it("pokazuje pełną tabelę nazw miejsc i pozwala nazwać wskazaną cyfrę", () => {
    const result = vi.fn();
    render(<DecimalNotationIntroLab activity="place-names" seed={1} questionNumber={1} questionCount={6} onResultChange={result} />);
    expect(screen.getAllByText("części tysięczne").length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole("button", { name: "części dziesiąte" }));
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
    expect(result).toHaveBeenLastCalledWith(true, "części dziesiąte");
  });

  it("miesza kolejność wskazywanych miejsc zamiast pytać od lewej do prawej", () => {
    const { rerender } = render(<DecimalNotationIntroLab activity="place-names" seed={1} questionNumber={1} questionCount={6} />);
    expect(screen.getByText(/miejsce cyfry/u)).toHaveTextContent("cyfry 6");
    rerender(<DecimalNotationIntroLab activity="place-names" seed={1} questionNumber={2} questionCount={6} />);
    expect(screen.getByText(/miejsce cyfry/u)).toHaveTextContent("cyfry 8");
  });

  it("zapisuje ułamki zwykłe pionowo i sprawdza także skrócenie", () => {
    const result = vi.fn();
    const { container } = render(<DecimalNotationIntroLab activity="decimal-to-fraction-practice" seed={1} questionNumber={1} questionCount={5} onResultChange={result} />);
    const keypad = container.querySelector<HTMLElement>("[data-lesson-numeric-keypad]")!;
    const fill = (label: string, digits: string) => {
      fireEvent.click(screen.getByLabelText(label));
      [...digits].forEach((digit) => press(keypad, digit));
    };
    fill("raw licznik", "6");
    fill("raw mianownik", "10");
    fill("reduced licznik", "3");
    fill("reduced mianownik", "5");
    fireEvent.click(within(keypad).getAllByRole("button").at(-1)!);
    expect(container.querySelectorAll("[data-fraction-fields]")).toHaveLength(2);
    expect(result).toHaveBeenLastCalledWith(true, "6/10 = 3/5");
  });

  it("wymaga rozszerzenia ułamka przed zapisem liczby dziesiętnej", () => {
    const result = vi.fn();
    const { container } = render(<DecimalNotationIntroLab activity="fraction-to-decimal-practice" seed={1} questionNumber={1} questionCount={5} onResultChange={result} />);
    const keypad = container.querySelector<HTMLElement>("[data-lesson-numeric-keypad]")!;
    const fill = (label: string, keys: string[]) => {
      fireEvent.click(screen.getByLabelText(label));
      keys.forEach((key) => press(keypad, key));
    };
    fill("expanded licznik", ["6"]);
    fill("expanded mianownik", ["1", "0"]);
    fill("wynik dziesiętny", ["0", ", przecinek", "6"]);
    fireEvent.click(within(keypad).getAllByRole("button").at(-1)!);
    expect(result).toHaveBeenLastCalledWith(true, "6/10 = 0,6");
  });

  it("pozwala wskazać właściwą kreskę osi", () => {
    const result = vi.fn();
    render(<DecimalNotationIntroLab activity="decimal-number-line" seed={1} questionNumber={1} questionCount={4} onResultChange={result} />);
    fireEvent.click(screen.getByRole("button", { name: "kreska 7" }));
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
    expect(result).toHaveBeenLastCalledWith(true, "0,7");
  });
});
