/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Grade4LargeNumberArithmeticLessonLab } from "@/components/lessons/models/Grade4LargeNumberArithmeticLessonLab";

describe("Grade4LargeNumberArithmeticLessonLab", () => {
  afterEach(cleanup);

  it("pokazuje pełne liczby w dodawaniu i odejmowaniu bez skrótu tys.", () => {
    render(<Grade4LargeNumberArithmeticLessonLab activity="information" />);
    expect(screen.getByRole("heading", { name: "Rachunki na dużych liczbach" })).toBeInTheDocument();
    expect(screen.getByText("48 000 + 36 000 = 84 000")).toBeInTheDocument();
    expect(screen.getByText("72 000 − 25 000 = 47 000")).toBeInTheDocument();
    expect(screen.queryByText(/48 tys\./u)).not.toBeInTheDocument();
    expect(screen.getByText("300 · 700 = 210 000")).toBeInTheDocument();
    expect(screen.getByText(/skreślamy tyle samo zer/u)).toBeInTheDocument();
    expect(screen.queryByText(/Potęgi dziesiątki skracają zapis/u)).not.toBeInTheDocument();
  });

  it("blokuje klawiaturę urządzenia i zalicza dodawanie", () => {
    const onResultChange = vi.fn();
    render(<Grade4LargeNumberArithmeticLessonLab activity="add-sub" questionNumber={1} questionCount={6} onResultChange={onResultChange} />);
    const input = screen.getByLabelText("Wynik działania");
    expect(input).toHaveAttribute("inputmode", "none");
    expect(input).toHaveAttribute("readonly");
    const keypad = screen.getByLabelText("Klawiatura do rachunków na dużych liczbach");
    for (const digit of "84000") fireEvent.click(within(keypad).getByRole("button", { name: digit }));
    fireEvent.click(within(keypad).getByRole("button", { name: "Zatwierdź" }));
    expect(onResultChange).toHaveBeenLastCalledWith(true, "84000");
  });

  it("zalicza dzielenie z parami zer", () => {
    const onResultChange = vi.fn();
    render(<Grade4LargeNumberArithmeticLessonLab activity="mul-div" questionNumber={5} questionCount={8} onResultChange={onResultChange} />);
    const keypad = screen.getByLabelText("Klawiatura do rachunków na dużych liczbach");
    for (const digit of "400") fireEvent.click(within(keypad).getByRole("button", { name: digit }));
    fireEvent.click(within(keypad).getByRole("button", { name: "Zatwierdź" }));
    expect(onResultChange).toHaveBeenLastCalledWith(true, "400");
  });

  it("oblicza działanie z potęgą dziesiątki", () => {
    const onResultChange = vi.fn();
    render(<Grade4LargeNumberArithmeticLessonLab activity="powers" questionNumber={4} questionCount={6} onResultChange={onResultChange} />);
    const keypad = screen.getByLabelText("Klawiatura do rachunków na dużych liczbach");
    for (const digit of "4000") fireEvent.click(within(keypad).getByRole("button", { name: digit }));
    fireEvent.click(within(keypad).getByRole("button", { name: "Zatwierdź" }));
    expect(onResultChange).toHaveBeenLastCalledWith(true, "4000");
  });
});
