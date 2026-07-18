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

function enterNumber(keypadLabel: string, value: string, advance = true) {
  const keypad = screen.getByLabelText(keypadLabel);
  for (const character of value) fireEvent.click(within(keypad).getByRole("button", { name: character }));
  fireEvent.click(within(keypad).getByRole("button", { name: "Zatwierdź" }));
  if (advance) act(() => vi.advanceTimersByTime(650));
}

describe("M5-4.11 — trapezy", () => {
  it("pokazuje podstawy i ramiona nad treścią oraz prowadzi dwa pytania", () => {
    vi.useFakeTimers();
    render(<GeometryLab seed={490301} />);
    expect(screen.getByRole("img", { name: "Trapez ABCD z podpisanymi podstawami i ramionami" })).toBeInTheDocument();
    expect(screen.getAllByText("PODSTAWA")).toHaveLength(2);
    expect(screen.getAllByText("RAMIĘ")).toHaveLength(2);
    solveChoice("Boki równoległe");
    expect(screen.getByText("Zadanie 2/2")).toBeInTheDocument();
    solveChoice("Ramiona", false);
  });

  it("rozróżnia trapez równoramienny i prostokątny bez kwadratowych oznaczeń kąta", () => {
    const { container } = render(<GeometryLab seed={490302} />);
    expect(screen.getByRole("img", { name: "Trapez równoramienny i trapez prostokątny" })).toBeInTheDocument();
    expect(container.querySelectorAll("[data-right-angle-mark] path")).toHaveLength(2);
    expect(container.querySelectorAll("[data-right-angle-mark] circle")).toHaveLength(2);
  });

  it("pokazuje własności kątów bez przypisywania trapezowi stałej miary", () => {
    const { container } = render(<GeometryLab seed={490303} />);
    expect(screen.getByText("α + β = 180°")).toBeInTheDocument();
    expect(screen.getByText("kąty przy każdej podstawie są równe")).toBeInTheDocument();
    expect(container.textContent).not.toMatch(/35°|65°/u);
  });

  it("prowadzi pięć różnych zadań kątowych, w tym kąt zewnętrzny", () => {
    vi.useFakeTimers();
    const onResultChange = vi.fn();
    const { container } = render(<GeometryLab seed={490304} onResultChange={onResultChange} />);
    enterNumber("Kalkulator do kątów trapezu", "112");
    enterNumber("Kalkulator do kątów trapezu", "72");
    enterNumber("Kalkulator do kątów trapezu", "62");
    enterNumber("Kalkulator do kątów trapezu", "116");
    expect(container.querySelector("[data-trapezoid-angle-task='exterior']")).toBeInTheDocument();
    enterNumber("Kalkulator do kątów trapezu", "48", false);
    expect(onResultChange).toHaveBeenLastCalledWith(true, "ukończono pięć zadań z kątami trapezów");
  });

  it("prowadzi pięć zadań obwodowych i zapisuje liczbę mieszaną jako ułamek zwykły", () => {
    vi.useFakeTimers();
    const onResultChange = vi.fn();
    render(<GeometryLab seed={490305} onResultChange={onResultChange} />);
    enterNumber("Kalkulator do obwodów trapezów", "42");
    enterNumber("Kalkulator do obwodów trapezów", "42");
    enterNumber("Kalkulator do obwodów trapezów", "8");
    expect(screen.getAllByRole("img", { name: "9 i 1/2" }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("img", { name: "5 i 1/2" }).length).toBeGreaterThan(0);
    enterNumber("Kalkulator do obwodów trapezów", "25");
    enterNumber("Kalkulator do obwodów trapezów", "8", false);
    expect(onResultChange).toHaveBeenLastCalledWith(true, "ukończono pięć zadań o obwodzie trapezu");
  });
});
