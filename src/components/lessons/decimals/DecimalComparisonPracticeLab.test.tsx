// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DecimalComparisonPracticeLab } from "@/components/lessons/decimals/DecimalComparisonPracticeLab";

afterEach(cleanup);

describe("DecimalComparisonPracticeLab", () => {
  it("sprawdza podchwytliwe porównanie 10,05 i 10,5", () => {
    const result = vi.fn();
    render(<DecimalComparisonPracticeLab activity="pair-comparison" seed={1} questionNumber={1} questionCount={10} onResultChange={result} />);
    fireEvent.click(screen.getByRole("button", { name: "<" }));
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
    expect(result).toHaveBeenLastCalledWith(true, "10,05 < 10,5");
  });

  it("rozpoznaje równe wartości z zerem końcowym", () => {
    const result = vi.fn();
    render(<DecimalComparisonPracticeLab activity="pair-comparison" seed={1} questionNumber={2} questionCount={10} onResultChange={result} />);
    fireEvent.click(screen.getByRole("button", { name: "=" }));
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
    expect(result).toHaveBeenLastCalledWith(true, "0,7 = 0,70");
  });

  it("pozwala ułożyć liczby od najmniejszej do największej", () => {
    const result = vi.fn();
    render(<DecimalComparisonPracticeLab activity="ascending-order" seed={1} questionNumber={1} questionCount={5} onResultChange={result} />);
    ["0,05", "0,5", "0,505", "0,55"].forEach((value) => fireEvent.click(screen.getByRole("button", { name: value })));
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
    expect(result).toHaveBeenLastCalledWith(true, "0,05 < 0,5 < 0,505 < 0,55");
  });

  it("przyjmuje dowolną poprawną liczbę w otwartej nierówności", () => {
    const result = vi.fn();
    const { container } = render(<DecimalComparisonPracticeLab activity="open-inequality" seed={1} questionNumber={1} questionCount={6} onResultChange={result} />);
    const keypad = container.querySelector<HTMLElement>("[data-lesson-numeric-keypad]")!;
    ["0", ", przecinek", "1"].forEach((key) => fireEvent.click(within(keypad).getByRole("button", { name: key })));
    fireEvent.click(within(keypad).getAllByRole("button").at(-1)!);
    expect(result).toHaveBeenLastCalledWith(true, "0,15 > 0,1");
  });
});
