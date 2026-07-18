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
  const keypad = screen.getByLabelText("Kalkulator do obwodów prostokątów i kwadratów");
  for (const character of value) {
    const name = character === "," ? ", przecinek" : character;
    fireEvent.click(within(keypad).getByRole("button", { name }));
  }
  fireEvent.click(within(keypad).getByRole("button", { name: "Zatwierdź" }));
  if (advance) act(() => vi.advanceTimersByTime(650));
}

describe("M5-4.9 — prostokąty i kwadraty", () => {
  it("umieszcza duże figury nad pełnymi własnościami i prowadzi trzy zadania rozpoznawcze", () => {
    vi.useFakeTimers();
    const onResultChange = vi.fn();
    const { container } = render(<GeometryLab seed={490101} onResultChange={onResultChange} />);
    const visual = container.querySelector("[data-rectangle-square-visual]");
    const header = screen.getByRole("heading", { name: "Własności prostokąta i kwadratu" });
    expect(visual).toBeInTheDocument();
    expect(visual!.compareDocumentPosition(header) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(container.querySelector("[data-rectangle-figure]")).toBeInTheDocument();
    expect(container.querySelector("[data-square-figure]")).toBeInTheDocument();
    expect(screen.getByText(/Każdy kwadrat jest prostokątem/u)).toBeInTheDocument();
    const firstOptions = screen.getByRole("button", { name: "Prostokąt" }).parentElement!;
    expect(within(firstOptions).getAllByRole("button").map((button) => button.textContent)).toEqual(["Prostokąt", "Kwadrat", "Trójkąt"]);

    solveChoice("Prostokąt");
    expect(screen.getByText("Zadanie 2/3")).toBeInTheDocument();
    const secondOptions = screen.getByRole("button", { name: "Kwadrat" }).parentElement!;
    expect(within(secondOptions).getAllByRole("button").map((button) => button.textContent)).toEqual(["Tylko prostokąt", "Kwadrat", "Trapez"]);
    solveChoice("Kwadrat");
    expect(screen.getByText("Zadanie 3/3")).toBeInTheDocument();
    const thirdOptions = screen.getByRole("button", { name: "Jest kwadratem i prostokątem" }).parentElement!;
    expect(within(thirdOptions).getAllByRole("button").map((button) => button.textContent)).toEqual(["Nie jest prostokątem", "Ma tylko jedną parę boków równoległych", "Jest kwadratem i prostokątem"]);
    solveChoice("Jest kwadratem i prostokątem", false);
    expect(onResultChange).toHaveBeenLastCalledWith(true, "ukończono 3 zadania: Własności prostokąta i kwadratu");
  });

  it("pokazuje przekątne i sprawdza ich własności w trzech kolejnych pytaniach", () => {
    vi.useFakeTimers();
    const onResultChange = vi.fn();
    const { container } = render(<GeometryLab seed={490102} onResultChange={onResultChange} />);
    expect(screen.getByRole("heading", { name: "Przekątne prostokąta i kwadratu" })).toBeInTheDocument();
    expect(screen.getAllByText(/przecinają się w połowie/u).length).toBeGreaterThanOrEqual(2);
    expect(container.querySelectorAll("[data-diagonal]")).toHaveLength(2);
    expect(container.querySelector("[data-square-perpendicular]")).toBeInTheDocument();

    const firstOptions = screen.getByRole("button", { name: "Są równe i przecinają się w połowie" }).parentElement!;
    expect(within(firstOptions).getAllByRole("button").map((button) => button.textContent)).toEqual(["Zawsze mają różne długości", "Są równe i przecinają się w połowie", "Nie przecinają się"]);
    solveChoice("Są równe i przecinają się w połowie");
    const secondOptions = screen.getByRole("button", { name: "W kwadracie" }).parentElement!;
    expect(within(secondOptions).getAllByRole("button").map((button) => button.textContent)).toEqual(["W każdym prostokącie", "W żadnej", "W kwadracie"]);
    solveChoice("W kwadracie");
    const thirdOptions = screen.getByRole("button", { name: "Kwadrat" }).parentElement!;
    expect(within(thirdOptions).getAllByRole("button").map((button) => button.textContent)).toEqual(["Prostokąt niebędący kwadratem", "Kwadrat", "Dowolny czworokąt"]);
    solveChoice("Kwadrat", false);
    expect(onResultChange).toHaveBeenLastCalledWith(true, "ukończono 3 zadania: Przekątne prostokąta i kwadratu");
  });

  it("prowadzi pięć zadań obwodowych w obu kierunkach i obsługuje przecinek", () => {
    vi.useFakeTimers();
    const onResultChange = vi.fn();
    render(<GeometryLab seed={490103} onResultChange={onResultChange} />);
    expect(screen.getByText("Zadanie 1/5")).toBeInTheDocument();
    expect(screen.getAllByText(/4 1\/2 cm/u).length).toBeGreaterThanOrEqual(1);

    enterNumber("18");
    enterNumber("12");
    enterNumber("6,5");
    enterNumber("6");
    enterNumber("18", false);

    expect(onResultChange).toHaveBeenLastCalledWith(true, "ukończono pięć zadań o obwodach prostokątów i kwadratów");
    expect(screen.getByRole("status")).toHaveTextContent("Dobrze");
  });
});
