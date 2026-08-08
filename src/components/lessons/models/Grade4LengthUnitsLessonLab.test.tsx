/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Grade4LengthUnitsLessonLab } from "@/components/lessons/models/Grade4LengthUnitsLessonLab";

describe("Grade4LengthUnitsLessonLab", () => {
  afterEach(cleanup);

  it("pokazuje jednostki i poprawne zależności", () => {
    render(<Grade4LengthUnitsLessonLab activity="information" />);
    expect(screen.getByRole("heading", { name: "Jednostki długości" })).toBeInTheDocument();
    for (const relation of ["1 cm = 10 mm", "1 dm = 10 cm", "1 m = 100 cm", "1 km = 1000 m"]) {
      expect(screen.getByText(relation)).toBeInTheDocument();
    }
  });

  it("zalicza dobór milimetrów do grubości śrubki", () => {
    const onResultChange = vi.fn();
    render(<Grade4LengthUnitsLessonLab activity="choose-unit" questionNumber={4} questionCount={6} onResultChange={onResultChange} />);
    fireEvent.click(screen.getByRole("button", { name: "mm" }));
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
    expect(onResultChange).toHaveBeenLastCalledWith(true, "mm");
  });

  it("blokuje klawiaturę urządzenia i zalicza prostą zamianę", () => {
    const onResultChange = vi.fn();
    render(<Grade4LengthUnitsLessonLab activity="convert" questionNumber={1} questionCount={8} onResultChange={onResultChange} />);
    const input = screen.getByLabelText("Wynik 1 w mm");
    expect(input).toHaveAttribute("inputmode", "none");
    expect(input).toHaveAttribute("readonly");
    const keypad = screen.getByLabelText("Klawiatura do zamiany długości");
    for (const digit of "50") fireEvent.click(within(keypad).getByRole("button", { name: digit }));
    fireEvent.click(within(keypad).getByRole("button", { name: "Zatwierdź" }));
    expect(onResultChange).toHaveBeenLastCalledWith(true, "50");
  });

  it("obsługuje zapis łączony 3 cm 5 mm w dwóch kratkach", () => {
    const onResultChange = vi.fn();
    render(<Grade4LengthUnitsLessonLab activity="convert" questionNumber={5} questionCount={8} onResultChange={onResultChange} />);
    const cmInput = screen.getByLabelText("Wynik 1 w cm");
    const mmInput = screen.getByLabelText("Wynik 2 w mm");
    for (const input of [cmInput, mmInput]) {
      expect(input).toHaveAttribute("inputmode", "none");
      expect(input).toHaveAttribute("readonly");
    }
    const keypad = screen.getByLabelText("Klawiatura do zamiany długości");
    fireEvent.click(within(keypad).getByRole("button", { name: "3" }));
    fireEvent.click(mmInput);
    fireEvent.click(within(keypad).getByRole("button", { name: "5" }));
    fireEvent.click(within(keypad).getByRole("button", { name: "Zatwierdź" }));
    expect(onResultChange).toHaveBeenLastCalledWith(true, "3|5");
  });

  it("pokazuje drogowskaz i zalicza trasę zapisaną w km i m", () => {
    const onResultChange = vi.fn();
    render(<Grade4LengthUnitsLessonLab activity="route" questionNumber={1} questionCount={1} onResultChange={onResultChange} />);
    expect(screen.getByRole("img", { name: /drogowskazie/u })).toHaveAttribute("src", expect.stringContaining("route-signpost.png"));
    const kmInput = screen.getByLabelText("Wynik 1 w km");
    const mInput = screen.getByLabelText("Wynik 2 w m");
    const keypad = screen.getByLabelText("Klawiatura do zadania z trasą");
    fireEvent.click(within(keypad).getByRole("button", { name: "2" }));
    fireEvent.click(mInput);
    for (const digit of "750") fireEvent.click(within(keypad).getByRole("button", { name: digit }));
    fireEvent.click(within(keypad).getByRole("button", { name: "Zatwierdź" }));
    expect(kmInput).toHaveAttribute("readonly");
    expect(mInput).toHaveAttribute("inputmode", "none");
    expect(onResultChange).toHaveBeenLastCalledWith(true, "2|750");
  });
});
