/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Grade4PowersLessonLab } from "@/components/lessons/models/Grade4PowersLessonLab";

describe("Grade4PowersLessonLab", () => {
  afterEach(cleanup);

  it("wyjaśnia kwadrat, sześcian, podstawę i wykładnik", () => {
    render(<Grade4PowersLessonLab activity="information" />);
    expect(screen.getByLabelText("4 do potęgi 2")).toBeInTheDocument();
    expect(screen.getByLabelText("3 do potęgi 3")).toBeInTheDocument();
    expect(screen.getByLabelText("Kwadrat z 16 pól").children).toHaveLength(16);
    expect(screen.getByLabelText("Trzy warstwy po 9 pól").children).toHaveLength(3);
    expect(screen.getByText(/podstawa potęgi/)).toBeInTheDocument();
    expect(screen.getByText(/wykładnik potęgi/)).toBeInTheDocument();
  });

  it("blokuje klawiaturę urządzenia i oblicza prostą potęgę", () => {
    const onResultChange = vi.fn();
    render(<Grade4PowersLessonLab activity="calculate" questionNumber={1} questionCount={8} onResultChange={onResultChange} />);
    const input = screen.getByLabelText("Wartość potęgi");
    expect(input).toHaveAttribute("inputmode", "none");
    expect(input).toHaveAttribute("readonly");

    const keypad = screen.getByRole("region", { name: "Klawiatura do obliczania potęg" });
    fireEvent.click(within(keypad).getByRole("button", { name: "4" }));
    fireEvent.click(within(keypad).getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByRole("status")).toHaveTextContent("Brawo");
    expect(onResultChange).toHaveBeenLastCalledWith(true, "2^2=4");
  });

  it("podaje potęgę słownie bez wcześniejszego pokazania zapisu symbolicznego", () => {
    const onResultChange = vi.fn();
    render(<Grade4PowersLessonLab activity="words" questionNumber={1} questionCount={5} onResultChange={onResultChange} />);
    expect(screen.getByText("Oblicz: „osiem do potęgi drugiej”.")).toBeInTheDocument();
    expect(screen.queryByLabelText("8 do potęgi 2")).not.toBeInTheDocument();

    const keypad = screen.getByRole("region", { name: "Klawiatura do obliczania potęg" });
    fireEvent.click(within(keypad).getByRole("button", { name: "6" }));
    fireEvent.click(within(keypad).getByRole("button", { name: "4" }));
    fireEvent.click(within(keypad).getByRole("button", { name: "Zatwierdź" }));
    expect(onResultChange).toHaveBeenLastCalledWith(true, "8^2=64");
  });

  it("pokazuje, jak rozpisujemy inne potęgi", () => {
    render(<Grade4PowersLessonLab activity="curiosity" />);
    expect(screen.getAllByLabelText("2 do potęgi 4").length).toBeGreaterThan(0);
    expect(screen.getByLabelText("3 do potęgi 5")).toBeInTheDocument();
    expect(screen.getByText(/nie oznacza 2 · 4/)).toBeInTheDocument();
  });

  it("zalicza poprawne rozpisanie potęgi na jednakowe czynniki", () => {
    const onResultChange = vi.fn();
    render(<Grade4PowersLessonLab activity="expand" questionNumber={1} questionCount={5} onResultChange={onResultChange} />);
    fireEvent.click(screen.getByRole("button", { name: "2 · 2 · 2 · 2" }));
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź odpowiedź" }));
    expect(screen.getByRole("status")).toHaveTextContent("Wykładnik 4 oznacza 4 jednakowych czynników.");
    expect(onResultChange).toHaveBeenLastCalledWith(true, "2 · 2 · 2 · 2");
  });

  it("podaje wspierający komunikat po błędnym rozpisaniu", () => {
    render(<Grade4PowersLessonLab activity="expand" questionNumber={1} questionCount={5} />);
    fireEvent.click(screen.getByRole("button", { name: "2 · 4" }));
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź odpowiedź" }));
    expect(screen.getByRole("status")).toHaveTextContent("Spróbuj innym razem. Poprawny zapis to 2 · 2 · 2 · 2. Dziś bez punktu.");
  });
});
