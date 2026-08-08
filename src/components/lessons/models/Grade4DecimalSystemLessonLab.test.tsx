/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Grade4DecimalSystemLessonLab } from "@/components/lessons/models/Grade4DecimalSystemLessonLab";

describe("Grade4DecimalSystemLessonLab", () => {
  afterEach(cleanup);

  it("wyjaśnia liczby naturalne, dziesięć cyfr i system dziesiątkowy", () => {
    render(<Grade4DecimalSystemLessonLab activity="information" />);

    expect(screen.getByRole("heading", { name: "System dziesiątkowy" })).toBeInTheDocument();
    expect(screen.getByLabelText("Dziesięć cyfr systemu dziesiątkowego")).toHaveTextContent("0123456789");
    expect(screen.getByText("0, 1, 2, 3, 4, …")).toBeInTheDocument();
  });

  it("pokazuje grupy cyfr oraz skróty tys., mln i mld", () => {
    render(<Grade4DecimalSystemLessonLab activity="groups" />);

    expect(screen.getByText("grupa jedności")).toBeInTheDocument();
    expect(screen.getByText("grupa tysięcy")).toBeInTheDocument();
    expect(screen.getByText("grupa milionów")).toBeInTheDocument();
    expect(screen.getByText("grupa miliardów")).toBeInTheDocument();
    expect(screen.getByText("tys.")).toBeInTheDocument();
    expect(screen.getByText("mln")).toBeInTheDocument();
    expect(screen.getByText("mld")).toBeInTheDocument();
  });

  it("blokuje klawiaturę urządzenia i zalicza zapis liczby cyframi", () => {
    const onResultChange = vi.fn();
    render(<Grade4DecimalSystemLessonLab activity="digits" questionNumber={1} questionCount={6} onResultChange={onResultChange} />);

    const input = screen.getByLabelText("Liczba zapisana cyframi");
    expect(input).toHaveAttribute("inputmode", "none");
    expect(input).toHaveAttribute("readonly");

    const keypad = screen.getByLabelText("Klawiatura do zapisywania liczb");
    fireEvent.click(within(keypad).getByRole("button", { name: "4" }));
    fireEvent.click(within(keypad).getByRole("button", { name: "2" }));
    fireEvent.click(within(keypad).getByRole("button", { name: "Zatwierdź" }));

    expect(onResultChange).toHaveBeenLastCalledWith(true, "42");
    expect(screen.getByText(/Poprawny zapis to 42/u)).toBeInTheDocument();
  });

  it("pozwala samodzielnie ułożyć pełny zapis słowny", () => {
    const onResultChange = vi.fn();
    render(<Grade4DecimalSystemLessonLab activity="words" questionNumber={1} questionCount={5} onResultChange={onResultChange} />);

    const bank = screen.getByLabelText("Bank wyrazów");
    fireEvent.click(within(bank).getByRole("button", { name: "dwadzieścia" }));
    fireEvent.click(within(bank).getByRole("button", { name: "pięć" }));
    fireEvent.click(within(bank).getByRole("button", { name: "Zatwierdź" }));

    expect(onResultChange).toHaveBeenLastCalledWith(true, "dwadzieścia pięć");
    expect(screen.getByText(/25 zapisujemy: dwadzieścia pięć/u)).toBeInTheDocument();
  });

  it("odsłania litery szyfru w innej kolejności niż hasło", () => {
    const onResultChange = vi.fn();
    render(<Grade4DecimalSystemLessonLab activity="cipher" questionNumber={1} questionCount={6} onResultChange={onResultChange} />);

    expect(screen.getByLabelText("Odszyfrowane hasło")).toHaveTextContent("??????");
    const keypad = screen.getByLabelText("Klawiatura do zapisywania liczb");
    for (const digit of "7000000") fireEvent.click(within(keypad).getByRole("button", { name: digit }));
    fireEvent.click(within(keypad).getByRole("button", { name: "Zatwierdź" }));

    expect(onResultChange).toHaveBeenLastCalledWith(true, "7000000");
    expect(screen.getByLabelText("Odszyfrowane hasło")).toHaveTextContent("??C???");
  });
});
