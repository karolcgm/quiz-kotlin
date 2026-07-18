// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DecimalUnitConversionLessonLab } from "@/components/lessons/decimals/DecimalUnitConversionLessonLab";

afterEach(cleanup);

function enter(container: HTMLElement, keys: string[]) {
  const keypad = container.querySelector<HTMLElement>("[data-lesson-numeric-keypad]")!;
  keys.forEach((key) => fireEvent.click(within(keypad).getByRole("button", { name: key })));
  fireEvent.click(within(keypad).getAllByRole("button").at(-1)!);
}

describe("DecimalUnitConversionLessonLab", () => {
  it("pokazuje jedną linijkę i pięć odczytów długości", () => {
    render(<DecimalUnitConversionLessonLab activity="length-units-ruler" seed={1} />);
    expect(screen.getByRole("slider", { name: "Przesuń znacznik na linijce" })).toBeInTheDocument();
    expect(screen.getByText("km → m → dm → cm → mm")).toBeInTheDocument();
    expect(screen.getByText("1 m = 10 dm = 100 cm = 1000 mm")).toBeInTheDocument();
  });

  it("pokazuje pełną teorię jednostek masy", () => {
    render(<DecimalUnitConversionLessonLab activity="mass-units-theory" seed={1} />);
    expect(screen.getByText("1 t = 1000 kg")).toBeInTheDocument();
    expect(screen.getByText("1 kg = 100 dag = 1000 g")).toBeInTheDocument();
    expect(screen.getByText("1 dag = 10 g")).toBeInTheDocument();
  });

  it("sprawdza 8 cm = 80 mm", () => {
    const result = vi.fn();
    const { container } = render(<DecimalUnitConversionLessonLab activity="unit-conversion-practice" seed={1} questionNumber={1} questionCount={10} onResultChange={result} />);
    enter(container, ["8", "0"]);
    expect(result).toHaveBeenLastCalledWith(true, "8 cm = 80 mm");
  });

  it("sprawdza 0,4 cm = 4 mm", () => {
    const result = vi.fn();
    const { container } = render(<DecimalUnitConversionLessonLab activity="unit-conversion-practice" seed={1} questionNumber={2} questionCount={10} onResultChange={result} />);
    enter(container, ["4"]);
    expect(result).toHaveBeenLastCalledWith(true, "0,4 cm = 4 mm");
  });
});
