/** @vitest-environment jsdom */

import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TriangleAngleSumGeometryLab } from "@/components/lessons/geometry/TriangleAngleSumGeometryLab";
import { createPublicTriangleAngleSumTask, isTriangleAngleSumLessonSeed } from "@/lib/math/geometry/triangleAngleSum";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

function enterAngles(...values: number[]) {
  const keypad = screen.getByLabelText("Klawiatura do brakującego kąta");
  const inputs = screen.getAllByLabelText(/Brakujący kąt(?: \d)? \(°\)/u);
  values.forEach((value, index) => {
    fireEvent.click(inputs[index]!);
    for (const digit of String(value)) fireEvent.click(within(keypad).getByRole("button", { name: digit }));
  });
  fireEvent.click(within(keypad).getByRole("button", { name: "Zatwierdź" }));
}

describe("TriangleAngleSumGeometryLab — WP-S4-08", () => {
  it("generuje stabilne zadanie i rozpoznaje seedy pakietu", () => {
    expect(isTriangleAngleSumLessonSeed(480101)).toBe(true);
    expect(isTriangleAngleSumLessonSeed(490101)).toBe(false);
    expect(createPublicTriangleAngleSumTask(480101).angles.reduce((sum, value) => sum + value, 0)).toBe(180);
  });

  it("pokazuje trzy informacje bez pola odpowiedzi i utrzymuje poprawny trójkąt podczas zmiany kątów", () => {
    const onResultChange = vi.fn();
    const view = render(<TriangleAngleSumGeometryLab seed={480101} onResultChange={onResultChange} />);
    expect(view.container.querySelector("[data-triangle-angle-sum-lab]")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Suma kątów w trójkącie wynosi 180°" })).toBeInTheDocument();
    expect(screen.queryByLabelText("Brakujący kąt (°)")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Sprawdź" })).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/Kąt A:/u), { target: { value: "80" } });
    const firstAngles = Array.from(view.container.querySelectorAll("[data-angle-value]")).map((node) => Number(node.getAttribute("data-angle-value")));
    expect(firstAngles).toHaveLength(3);
    expect(firstAngles.reduce((sum, value) => sum + value, 0)).toBe(180);
    expect(view.container.querySelector("polygon")?.getAttribute("points")).not.toMatch(/NaN|Infinity/u);

    fireEvent.click(screen.getByRole("button", { name: "Następna informacja →" }));
    expect(screen.getByRole("heading", { name: "Trójkąt równoboczny" })).toBeInTheDocument();
    expect(Array.from(view.container.querySelectorAll("[data-angle-value]")).map((node) => node.getAttribute("data-angle-value"))).toEqual(["60", "60", "60"]);

    fireEvent.click(screen.getByRole("button", { name: "Następna informacja →" }));
    expect(screen.getByRole("heading", { name: "Trójkąt równoramienny" })).toBeInTheDocument();
    expect(Array.from(view.container.querySelectorAll("[data-angle-value]")).map((node) => node.getAttribute("data-angle-value"))).toEqual(["65", "65", "50"]);
    expect(view.container.querySelectorAll('[data-equal-angle-arc="true"]')).toHaveLength(2);
    expect(screen.getByText("Kąty przy podstawie mają takie same miary.")).toBeInTheDocument();
    expect(screen.queryByText("65°")).not.toBeInTheDocument();
    expect(screen.queryByText(/65° \+ 65°/u)).not.toBeInTheDocument();
    expect(onResultChange).toHaveBeenLastCalledWith(true, "poznano sumę kątów oraz własności trójkąta równobocznego i równoramiennego");
  });

  it("na kolejnych slajdach pokazuje różne trójkąty i aktywne pole brakującego kąta", () => {
    const view = render(<TriangleAngleSumGeometryLab seed={480102} />);
    expect(screen.getByLabelText("Brakujący kąt (°)")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Różne kąty w trójkącie" })).toBeInTheDocument();
    expect(view.container.querySelector("[data-missing-angle-task='general-52-68']")).toBeInTheDocument();

    enterAngles(60);
    expect(screen.getByRole("status")).toHaveTextContent("Dobrze. Brakujący kąt ma 60°.");
    expect(view.container.querySelector("[data-angle-value='60'] text")).toHaveTextContent("60°");

    view.rerender(<TriangleAngleSumGeometryLab seed={480103} />);
    expect(screen.getByRole("heading", { name: "Trójkąt prostokątny" })).toBeInTheDocument();
    expect(view.container.querySelector("[data-right-angle-dot]")).toBeInTheDocument();

    view.rerender(<TriangleAngleSumGeometryLab seed={480104} />);
    expect(screen.getByRole("heading", { name: "Równe boki — równe kąty" })).toBeInTheDocument();
    expect(view.container.querySelectorAll("[data-side-label]")).toHaveLength(2);
    expect(screen.getAllByLabelText(/Brakujący kąt \d \(°\)/u)).toHaveLength(2);
  });

  it("prowadzi ucznia kolejno przez pięć zróżnicowanych zadań", () => {
    vi.useFakeTimers();
    const onResultChange = vi.fn();
    render(<TriangleAngleSumGeometryLab seed={480105} onResultChange={onResultChange} />);

    const answers = [[70], [62], [72, 72], [60], [34, 34]];
    for (const [index, answer] of answers.entries()) {
      expect(screen.getByText(`Zadanie ${index + 1}/5`)).toBeInTheDocument();
      enterAngles(...answer);
      if (index < 4) act(() => vi.advanceTimersByTime(650));
    }

    expect(screen.getByText("Wszystkie pięć różnych trójkątów zostało rozwiązanych.")).toBeInTheDocument();
    expect(onResultChange).toHaveBeenLastCalledWith(true, "ukończono pięć różnych zadań z miarami kątów w trójkątach");
  });

  it("w klasie VI pokazuje przedłużone boki oraz kąty zewnętrzne", () => {
    const view = render(<TriangleAngleSumGeometryLab seed={480106} />);

    expect(screen.getByText("Zadanie 1/5")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Kąt przyległy przy podstawie" })).toBeInTheDocument();
    expect(view.container.querySelectorAll("[data-side-extension]")).toHaveLength(1);
    expect(view.container.querySelector('[data-external-angle="adjacent"]')).toHaveTextContent("130°");

    enterAngles(88);
    expect(screen.getByRole("status")).toHaveTextContent("Dobrze. Brakujący kąt ma 88°.");
  });

  it("używa osobnego zadania zamiast slajdu informacyjnego w pytaniach końcowych", () => {
    const view = render(<TriangleAngleSumGeometryLab seed={480111} />);
    expect(view.container.querySelector("[data-angle-sum-information-series]")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Trójkąt różnoboczny" })).toBeInTheDocument();
  });
});
