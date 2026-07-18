/** @vitest-environment jsdom */

import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GeometryLab } from "@/components/lessons/geometry/GeometryLab";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

function solveChoice(answer: string, advance = true) {
  fireEvent.click(screen.getByRole("button", { name: answer }));
  fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
  if (advance) act(() => vi.advanceTimersByTime(650));
}

function enterNumber(value: string, advance = true) {
  const keypad = screen.getByLabelText("Kalkulator do obwodów równoległoboków i rombów");
  for (const character of value) fireEvent.click(within(keypad).getByRole("button", { name: character }));
  fireEvent.click(within(keypad).getByRole("button", { name: "Zatwierdź" }));
  if (advance) act(() => vi.advanceTimersByTime(650));
}

function enterMixedNumber(whole: string, numerator: string, denominator: string, advance = true) {
  const keypad = screen.getByLabelText("Kalkulator do obwodów równoległoboków i rombów");
  fireEvent.click(screen.getByRole("button", { name: "Część całkowita odpowiedzi" }));
  for (const character of whole) fireEvent.click(within(keypad).getByRole("button", { name: character }));
  fireEvent.click(screen.getByRole("button", { name: "Licznik odpowiedzi" }));
  for (const character of numerator) fireEvent.click(within(keypad).getByRole("button", { name: character }));
  fireEvent.click(screen.getByRole("button", { name: "Mianownik odpowiedzi" }));
  for (const character of denominator) fireEvent.click(within(keypad).getByRole("button", { name: character }));
  fireEvent.click(within(keypad).getByRole("button", { name: "Zatwierdź" }));
  if (advance) act(() => vi.advanceTimersByTime(650));
}

describe("M5-4.10 — równoległoboki i romby", () => {
  it("pokazuje obie figury i prowadzi trzy zadania rozpoznawcze", () => {
    vi.useFakeTimers();
    const onResultChange = vi.fn();
    const { container } = render(<GeometryLab seed={490201} onResultChange={onResultChange} />);
    expect(container.querySelector("[data-parallelogram-figure]")).toBeInTheDocument();
    expect(container.querySelector("[data-rhombus-figure]")).toBeInTheDocument();
    expect(screen.getByText(/Romb jest równoległobokiem/u)).toBeInTheDocument();
    const visual = container.querySelector("svg")!;
    expect(visual.textContent).toContain("α + β = 180°");
    expect(visual.textContent).not.toMatch(/35°|65°/u);

    solveChoice("Romb");
    expect(screen.getByText("Zadanie 2/3")).toBeInTheDocument();
    solveChoice("Równoległobok");
    expect(screen.getByText("Zadanie 3/3")).toBeInTheDocument();
    solveChoice("108°", false);
    expect(onResultChange).toHaveBeenLastCalledWith(true, "ukończono 3 zadania: Własności równoległoboku i rombu");
  });

  it("pokazuje przekątne obu figur i prostopadłość tylko w rombie", () => {
    const { container } = render(<GeometryLab seed={490202} />);
    expect(container.querySelectorAll("[data-diagonal]")).toHaveLength(2);
    expect(container.querySelectorAll("[data-rhombus-perpendicular]")).toHaveLength(1);
    expect(screen.getByText(/Przekątne równoległoboku przecinają się w swoich środkach/u)).toBeInTheDocument();
    expect(screen.getByText(/W rombie przekątne są dodatkowo prostopadłe/u)).toBeInTheDocument();
  });

  it("prowadzi pięć zadań obwodowych i zapisuje liczby mieszane jako ułamki zwykłe", () => {
    vi.useFakeTimers();
    const onResultChange = vi.fn();
    render(<GeometryLab seed={490203} onResultChange={onResultChange} />);
    expect(screen.getByText("Zadanie 1/5")).toBeInTheDocument();
    expect(screen.queryByText(/ułamki dziesiętne/iu)).not.toBeInTheDocument();

    enterNumber("24");
    enterNumber("26");
    expect(screen.getByLabelText("Romb").textContent).toContain("Obw = 34 cm");
    expect(screen.getByLabelText("Romb").textContent).not.toContain("P =");
    enterMixedNumber("8", "1", "2");
    expect(screen.getByLabelText("Równoległobok").textContent).toContain("Obw = 28 cm");
    expect(screen.getByLabelText("Równoległobok").textContent).not.toContain("P =");
    enterMixedNumber("9", "1", "2");
    enterNumber("12", false);

    expect(onResultChange).toHaveBeenLastCalledWith(true, "ukończono pięć zadań o obwodach równoległoboków i rombów");
  });
});
