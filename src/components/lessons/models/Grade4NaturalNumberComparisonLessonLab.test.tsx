/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Grade4NaturalNumberComparisonLessonLab } from "@/components/lessons/models/Grade4NaturalNumberComparisonLessonLab";

describe("Grade4NaturalNumberComparisonLessonLab", () => {
  afterEach(cleanup);

  it("wyjaśnia znaki i porównywanie od lewej strony", () => {
    render(<Grade4NaturalNumberComparisonLessonLab activity="information" />);
    expect(screen.getByText("63 > 48")).toBeInTheDocument();
    expect(screen.getByText("27 < 51")).toBeInTheDocument();
    expect(screen.getByText(/2. Zacznij od lewej/u)).toBeInTheDocument();
  });

  it("pozwala wybrać dokładnie jeden znak porównania", () => {
    const onResultChange = vi.fn();
    render(<Grade4NaturalNumberComparisonLessonLab activity="compare" questionNumber={1} questionCount={7} onResultChange={onResultChange} />);
    const controls = screen.getByLabelText("Wybór znaku porównania");
    fireEvent.click(within(controls).getByRole("button", { name: ">" }));
    fireEvent.click(within(controls).getByRole("button", { name: "Zatwierdź" }));
    expect(onResultChange).toHaveBeenLastCalledWith(true, ">");
    expect(screen.getByText(/52 > 47/u)).toBeInTheDocument();
  });

  it("zawiera podchwytliwe porównanie liczb na granicy kolejnego tysiąca", () => {
    const onResultChange = vi.fn();
    render(<Grade4NaturalNumberComparisonLessonLab activity="compare" questionNumber={4} questionCount={10} onResultChange={onResultChange} />);
    const controls = screen.getByLabelText("Wybór znaku porównania");
    fireEvent.click(within(controls).getByRole("button", { name: "<" }));
    fireEvent.click(within(controls).getByRole("button", { name: "Zatwierdź" }));
    expect(onResultChange).toHaveBeenLastCalledWith(true, "<");
    expect(screen.getByText(/Nie sugeruj się dużą liczbą dziewiątek/u)).toBeInTheDocument();
  });

  it("układa dotykane karty w kolejności rosnącej", () => {
    const onResultChange = vi.fn();
    render(<Grade4NaturalNumberComparisonLessonLab activity="order" questionNumber={1} questionCount={6} onResultChange={onResultChange} />);
    const cards = screen.getByLabelText("Karty liczb");
    for (const value of ["7", "42", "89", "105"]) fireEvent.click(within(cards).getByRole("button", { name: value }));
    fireEvent.click(within(cards).getByRole("button", { name: "Zatwierdź" }));
    expect(onResultChange).toHaveBeenLastCalledWith(true, "7,42,89,105");
    expect(screen.getByText(/7 < 42 < 89 < 105/u)).toBeInTheDocument();
  });

  it("blokuje klawiaturę urządzenia w sejfie cyfr", () => {
    const onResultChange = vi.fn();
    render(<Grade4NaturalNumberComparisonLessonLab activity="digit" questionNumber={1} questionCount={6} onResultChange={onResultChange} />);
    const expression = screen.getByRole("group", { name: "Nierówność z brakującą cyfrą" });
    const input = within(expression).getByLabelText("Brakująca cyfra");
    expect(input).toHaveAttribute("inputmode", "none");
    expect(input).toHaveAttribute("readonly");
    expect(screen.queryByText("Cyfra:")).not.toBeInTheDocument();
    const keypad = screen.getByLabelText("Klawiatura sejfu cyfr");
    fireEvent.click(within(keypad).getByRole("button", { name: "6" }));
    fireEvent.click(within(keypad).getByRole("button", { name: "Zatwierdź" }));
    expect(onResultChange).toHaveBeenLastCalledWith(true, "6");
  });
});
