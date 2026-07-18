/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TriangleAngleSumGeometryLab } from "@/components/lessons/geometry/TriangleAngleSumGeometryLab";
import { createPublicTriangleAngleSumTask, isTriangleAngleSumLessonSeed } from "@/lib/math/geometry/triangleAngleSum";

afterEach(cleanup);

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
    expect(screen.queryByText(/Suma aktualnych kątów/u)).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/Kąt A:/u), { target: { value: "80" } });
    const firstAngles = Array.from(view.container.querySelectorAll("[data-angle-value]")).map((node) => Number(node.getAttribute("data-angle-value")));
    expect(firstAngles).toHaveLength(3);
    expect(firstAngles.reduce((sum, value) => sum + value, 0)).toBe(180);
    expect(view.container.querySelector("polygon")?.getAttribute("points")).not.toMatch(/NaN|Infinity/u);

    fireEvent.click(screen.getByRole("button", { name: "Następna informacja →" }));
    expect(screen.getByRole("heading", { name: "Trójkąt równoboczny" })).toBeInTheDocument();
    expect(screen.getByText("W trójkącie równobocznym wszystkie kąty mają po 60°.")).toBeInTheDocument();
    expect(Array.from(view.container.querySelectorAll("[data-angle-value]")).map((node) => node.getAttribute("data-angle-value"))).toEqual(["60", "60", "60"]);

    fireEvent.click(screen.getByRole("button", { name: "Następna informacja →" }));
    expect(screen.getByRole("heading", { name: "Trójkąt równoramienny" })).toBeInTheDocument();
    expect(screen.getByText("W trójkącie równoramiennym dwa kąty przy podstawie mają taką samą miarę.")).toBeInTheDocument();
    expect(Array.from(view.container.querySelectorAll("[data-angle-value]")).map((node) => node.getAttribute("data-angle-value"))).toEqual(["65", "65", "50"]);
    expect(onResultChange).toHaveBeenLastCalledWith(true, "poznano sumę kątów oraz własności trójkąta równobocznego i równoramiennego");
  });

  it("pozostawia pole obliczeniowe na późniejszym slajdzie z brakującym kątem", () => {
    render(<TriangleAngleSumGeometryLab seed={480103} />);
    expect(screen.getByLabelText("Brakujący kąt (°)")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sprawdź" })).toBeInTheDocument();
  });
});
