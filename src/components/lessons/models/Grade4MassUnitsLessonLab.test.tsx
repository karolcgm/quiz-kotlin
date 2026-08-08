/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Grade4MassUnitsLessonLab } from "@/components/lessons/models/Grade4MassUnitsLessonLab";

describe("Grade4MassUnitsLessonLab", () => {
  afterEach(cleanup);

  it("pokazuje jednostki i poprawne zależności", () => {
    render(<Grade4MassUnitsLessonLab activity="information" />);
    expect(screen.getByRole("heading", { name: "Jednostki masy" })).toBeInTheDocument();
    for (const relation of ["1 dag = 10 g", "1 kg = 100 dag", "1 kg = 1000 g", "1 t = 1000 kg"]) {
      expect(screen.getByText(relation)).toBeInTheDocument();
    }
  });

  it("zalicza dobór ton do masy ciężarówki", () => {
    const onResultChange = vi.fn();
    render(<Grade4MassUnitsLessonLab activity="choose-unit" questionNumber={4} questionCount={6} onResultChange={onResultChange} />);
    fireEvent.click(screen.getByRole("button", { name: "t" }));
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
    expect(onResultChange).toHaveBeenLastCalledWith(true, "t");
  });

  it("blokuje klawiaturę urządzenia i zalicza prostą zamianę", () => {
    const onResultChange = vi.fn();
    render(<Grade4MassUnitsLessonLab activity="convert" questionNumber={1} questionCount={8} onResultChange={onResultChange} />);
    const input = screen.getByLabelText("Wynik 1 w g");
    expect(input).toHaveAttribute("inputmode", "none");
    expect(input).toHaveAttribute("readonly");
    const keypad = screen.getByLabelText("Klawiatura do zamiany masy");
    for (const digit of "50") fireEvent.click(within(keypad).getByRole("button", { name: digit }));
    fireEvent.click(within(keypad).getByRole("button", { name: "Zatwierdź" }));
    expect(onResultChange).toHaveBeenLastCalledWith(true, "50");
  });

  it("obsługuje zapis łączony 2 kg 35 dag w dwóch kratkach", () => {
    const onResultChange = vi.fn();
    render(<Grade4MassUnitsLessonLab activity="convert" questionNumber={5} questionCount={8} onResultChange={onResultChange} />);
    const kgInput = screen.getByLabelText("Wynik 1 w kg");
    const dagInput = screen.getByLabelText("Wynik 2 w dag");
    for (const input of [kgInput, dagInput]) {
      expect(input).toHaveAttribute("inputmode", "none");
      expect(input).toHaveAttribute("readonly");
    }
    const keypad = screen.getByLabelText("Klawiatura do zamiany masy");
    fireEvent.click(within(keypad).getByRole("button", { name: "2" }));
    fireEvent.click(dagInput);
    for (const digit of "35") fireEvent.click(within(keypad).getByRole("button", { name: digit }));
    fireEvent.click(within(keypad).getByRole("button", { name: "Zatwierdź" }));
    expect(onResultChange).toHaveBeenLastCalledWith(true, "2|35");
  });

  it("wyjaśnia netto, tarę i brutto oraz zalicza wynik", () => {
    const onResultChange = vi.fn();
    render(<Grade4MassUnitsLessonLab activity="net-gross" questionNumber={1} questionCount={4} onResultChange={onResultChange} />);
    expect(screen.getByRole("img", { name: /truskawkami/u })).toHaveAttribute("src", expect.stringContaining("net-gross-package.png"));
    const input = screen.getByLabelText("Wynik 1 w g");
    const keypad = screen.getByLabelText("Klawiatura do masy netto i brutto");
    for (const digit of "800") fireEvent.click(within(keypad).getByRole("button", { name: digit }));
    fireEvent.click(within(keypad).getByRole("button", { name: "Zatwierdź" }));
    expect(input).toHaveAttribute("readonly");
    expect(input).toHaveAttribute("inputmode", "none");
    expect(onResultChange).toHaveBeenLastCalledWith(true, "800");
  });

  it("pokazuje ilustrację, nie podaje gotowego działania i zalicza trzy pytania do przepisu", () => {
    const onResultChange = vi.fn();
    render(<Grade4MassUnitsLessonLab activity="recipe" questionNumber={1} questionCount={1} onResultChange={onResultChange} />);
    expect(screen.getByRole("img", { name: /muffinki/u })).toHaveAttribute("src", expect.stringContaining("recipe-muffins.png"));
    expect(screen.queryByText("25 dag mąki + 5 dag cukru + 300 g owoców =")).not.toBeInTheDocument();
    expect(screen.getByText("Ile gramów ważą razem cukier i owoce?")).toBeInTheDocument();
    expect(screen.getByText("O ile gramów owoce są cięższe od mąki?")).toBeInTheDocument();
    const inputs = [
      screen.getByLabelText("Podpunkt a, wynik w g"),
      screen.getByLabelText("Podpunkt b, wynik w g"),
      screen.getByLabelText("Podpunkt c, wynik w g"),
    ];
    for (const input of inputs) {
      expect(input).toHaveAttribute("readonly");
      expect(input).toHaveAttribute("inputmode", "none");
    }
    const keypad = screen.getByLabelText("Klawiatura do zadania z przepisem");
    ["600", "350", "50"].forEach((value, index) => {
      fireEvent.click(inputs[index]!);
      for (const digit of value) fireEvent.click(within(keypad).getByRole("button", { name: digit }));
    });
    fireEvent.click(within(keypad).getByRole("button", { name: "Zatwierdź" }));
    expect(onResultChange).toHaveBeenLastCalledWith(true, "600|350|50");
  });
});
