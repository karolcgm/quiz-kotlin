/** @vitest-environment jsdom */

import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
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

describe("M5-4.10 — równoległoboki i romby", () => {
  it("pokazuje obie figury i prowadzi trzy zadania rozpoznawcze", () => {
    vi.useFakeTimers();
    const onResultChange = vi.fn();
    const { container } = render(<GeometryLab seed={490201} onResultChange={onResultChange} />);
    expect(container.querySelector("[data-parallelogram-figure]")).toBeInTheDocument();
    expect(container.querySelector("[data-rhombus-figure]")).toBeInTheDocument();
    expect(screen.getByText(/Romb jest równoległobokiem/u)).toBeInTheDocument();

    solveChoice("Romb");
    expect(screen.getByText("Zadanie 2/3")).toBeInTheDocument();
    solveChoice("Przeciwległe boki są równoległe");
    expect(screen.getByText("Zadanie 3/3")).toBeInTheDocument();
    solveChoice("To równoległobok o czterech równych bokach", false);
    expect(onResultChange).toHaveBeenLastCalledWith(true, "ukończono 3 zadania: Jak rozpoznać obie figury?");
  });

  it("pokazuje przekątne obu figur i prostopadłość tylko w rombie", () => {
    const { container } = render(<GeometryLab seed={490202} />);
    expect(container.querySelectorAll("[data-diagonal]")).toHaveLength(2);
    expect(container.querySelectorAll("[data-rhombus-perpendicular]")).toHaveLength(1);
    expect(screen.getByText(/Przekątne równoległoboku przecinają się w swoich środkach/u)).toBeInTheDocument();
    expect(screen.getByText(/W rombie przekątne są dodatkowo prostopadłe/u)).toBeInTheDocument();
  });

  it("sprawdza kąty przeciwległe i sumę 180° kątów sąsiednich", () => {
    vi.useFakeTimers();
    const onResultChange = vi.fn();
    render(<GeometryLab seed={490203} onResultChange={onResultChange} />);
    expect(screen.getAllByText(/180°/u).length).toBeGreaterThan(0);

    solveChoice("115°");
    solveChoice("65°");
    solveChoice("52°, 128°, 52°", false);
    expect(onResultChange).toHaveBeenLastCalledWith(true, "ukończono 3 zadania: Kąty równoległoboku");
  });
});
