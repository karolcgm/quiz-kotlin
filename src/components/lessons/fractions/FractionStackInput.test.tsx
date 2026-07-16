/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FractionStackInput } from "@/components/lessons/fractions/FractionStackInput";
import type { FractionStackValue } from "@/types/fractions";

afterEach(() => cleanup());

function Harness({
  initial,
  showWholePart = false,
  onSubmit,
  fixedDigitCells,
  readOnlyParts,
}: {
  initial: FractionStackValue;
  showWholePart?: boolean;
  onSubmit?: ReturnType<typeof vi.fn>;
  fixedDigitCells?: { wholePart?: number; numerator: number; denominator: number };
  readOnlyParts?: Array<"wholePart" | "numerator" | "denominator">;
}) {
  const [value, setValue] = useState(initial);
  return (
    <>
      <FractionStackInput
        value={value}
        onChange={setValue}
        showWholePart={showWholePart}
        digitLimit={2}
        fixedDigitCells={fixedDigitCells}
        readOnlyParts={readOnlyParts}
        stepLabel="Uzupełnij zapis"
        onSubmit={onSubmit}
      />
      <output data-testid="state">{JSON.stringify(value)}</output>
    </>
  );
}

describe("FractionStackInput — klawiatura, dotyk i semantyka", () => {
  it("wpisuje jedną cyfrę do jednej kratki dotykiem, zwiększa liczbę kratek i przenosi focus", () => {
    render(<Harness initial={{ numerator: [""], denominator: [""] }} />);
    const one = screen.getByRole("button", { name: "1" });
    fireEvent.touchStart(one);
    fireEvent.touchEnd(one);
    fireEvent.click(one);

    expect(screen.queryByLabelText("licznik, cyfra 2 z 2")).not.toBeInTheDocument();
    expect(screen.getByLabelText("mianownik, cyfra 1 z 1")).toHaveFocus();
    expect(screen.getByTestId("state")).toHaveTextContent('"numerator":["1"]');

    fireEvent.click(screen.getByRole("button", { name: "2" }));
    expect(screen.getByLabelText("mianownik, cyfra 1 z 1")).toHaveValue("2");
  });

  it("przy własnej klawiaturze nie wywołuje klawiatury systemowej, ale przyjmuje cyfrę z klawiatury fizycznej", () => {
    render(<Harness initial={{ numerator: [""], denominator: [""] }} fixedDigitCells={{ numerator: 1, denominator: 1 }} />);
    const numerator = screen.getByLabelText("licznik, cyfra 1 z 1");

    expect(numerator).toHaveAttribute("inputmode", "none");
    expect(numerator).toHaveAttribute("readonly");
    expect(numerator).toHaveAttribute("data-system-keyboard-suppressed", "true");

    fireEvent.keyDown(numerator, { key: "7" });
    expect(numerator).toHaveValue("7");
    expect(screen.getByTestId("state")).toHaveTextContent('"numerator":["7"]');
  });

  it("w trybie dokładnych pól nie dodaje kratki i zachowuje wskazaną liczbę miejsc", () => {
    render(<Harness initial={{ numerator: [""], denominator: [""] }} fixedDigitCells={{ numerator: 1, denominator: 2 }} />);
    fireEvent.click(screen.getByRole("button", { name: "7" }));

    expect(screen.queryByLabelText("licznik, cyfra 2 z 2")).not.toBeInTheDocument();
    expect(screen.getByLabelText("mianownik, cyfra 1 z 2")).toHaveFocus();
    expect(screen.getAllByRole("textbox")).toHaveLength(3);
  });

  it("pozwala zablokować podany mianownik i wpisywać tylko brakujący licznik", () => {
    render(<Harness initial={{ numerator: [""], denominator: ["9"] }} fixedDigitCells={{ numerator: 1, denominator: 1 }} readOnlyParts={["denominator"]} />);
    expect(screen.getByLabelText("mianownik, cyfra 1 z 1")).toHaveAttribute("readonly");
    fireEvent.click(screen.getByRole("button", { name: "3" }));
    expect(screen.getByLabelText("licznik, cyfra 1 z 1")).toHaveValue("3");
    expect(screen.getByLabelText("mianownik, cyfra 1 z 1")).toHaveValue("9");
  });

  it("obsługuje strzałki, Backspace bez utraty focusu i Enter", () => {
    const onSubmit = vi.fn();
    render(<Harness initial={{ numerator: ["1", "2"], denominator: ["2", "5"] }} onSubmit={onSubmit} />);
    const numeratorSecond = screen.getByLabelText("licznik, cyfra 2 z 2");
    numeratorSecond.focus();
    fireEvent.keyDown(numeratorSecond, { key: "ArrowDown" });
    expect(screen.getByLabelText("mianownik, cyfra 2 z 2")).toHaveFocus();
    fireEvent.keyDown(document.activeElement as Element, { key: "Backspace" });
    expect(screen.getByLabelText("mianownik, cyfra 2 z 2")).toHaveFocus();
    expect(screen.getByLabelText("mianownik, cyfra 2 z 2")).toHaveValue("");
    fireEvent.change(screen.getByLabelText("mianownik, cyfra 2 z 2"), { target: { value: "5" } });
    fireEvent.keyDown(document.activeElement as Element, { key: "Enter" });
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
      ok: true,
      normalized: expect.objectContaining({ numerator: 12, denominator: 25 }),
    }));
  });

  it("nie zmniejsza liczby kratek po cofnięciu wpisanej cyfry", () => {
    render(<Harness initial={{ numerator: [""], denominator: ["5"] }} />);
    fireEvent.click(screen.getByRole("button", { name: "1" }));
    const numerator = screen.getByLabelText("licznik, cyfra 1 z 1");
    expect(screen.getByLabelText("mianownik, cyfra 1 z 1")).toHaveFocus();
    fireEvent.keyDown(numerator, { key: "Backspace" });
    expect(numerator).toHaveValue("");
    expect(screen.queryByLabelText("licznik, cyfra 2 z 2")).not.toBeInTheDocument();
  });

  it("zachowuje zero w mianowniku i pokazuje diagnostykę FRA_ZERO_DENOMINATOR", () => {
    render(<Harness initial={{ numerator: ["3"], denominator: ["0"] }} />);
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByLabelText("mianownik, cyfra 1 z 1")).toHaveValue("0");
    expect(screen.getByText("Na zero części nie można podzielić całości.")).toBeInTheDocument();
    expect(screen.getByText("Kody diagnostyczne: FRA_ZERO_DENOMINATOR")).toHaveClass("sr-only");
  });

  it("nie normalizuje pustego licznika, wskazuje brak i zachowuje focus", () => {
    const onSubmit = vi.fn();
    render(<Harness initial={{ numerator: [""], denominator: ["5"] }} onSubmit={onSubmit} />);
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByLabelText("licznik, cyfra 1 z 1")).toHaveFocus();
    expect(screen.getByText("Jedna z części zapisu ułamka jest pusta.")).toBeInTheDocument();
  });

  it("ma osobne kratki liczby mieszanej i pełny tekst dla czytnika ekranu", () => {
    render(<Harness initial={{ wholePart: ["1"], numerator: ["3"], denominator: ["4"] }} showWholePart />);
    expect(screen.getByLabelText("część całkowita, cyfra 1 z 1")).toHaveValue("1");
    expect(screen.getByText(/część całkowita 1, licznik 3, mianownik 4\. Aktualny krok: Uzupełnij zapis/u)).toHaveClass("sr-only");
    expect(screen.getAllByRole("textbox")).toHaveLength(3);
  });
});
