// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { GeometryLab } from "@/components/lessons/geometry/GeometryLab";

afterEach(cleanup);

describe("WP-S4-06 — Trójkątny plac zabaw", () => {
  it("ukrywa dwie nazwy do chwili przewidywania i udziela konkretnego feedbacku", () => {
    render(<GeometryLab seed={460201} />);
    expect(screen.getByText(/Nazwy są ukryte/u)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Według boków"), { target: { value: "isosceles" } });
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź obie klasyfikacje" }));
    expect(screen.getAllByText("Brakuje jednej z dwóch klasyfikacji.").length).toBeGreaterThan(0);
    fireEvent.change(screen.getByLabelText("Według kątów"), { target: { value: "acute" } });
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź obie klasyfikacje" }));
    expect(screen.getAllByText("równoramienny").length).toBeGreaterThan(1);
    expect(screen.getAllByText("ostrokątny").length).toBeGreaterThan(1);
  });

  it("rysuje duży plac zabaw nad wyborem i pokazuje proste długości równych boków", () => {
    const { container } = render(<GeometryLab seed={460101} />);
    expect(container.querySelector('[data-geometry-theme="playground"]')).toBeInTheDocument();
    expect(container.querySelectorAll("[data-geometry-angle]")).toHaveLength(3);
    expect(container.querySelectorAll("[data-equal-side-mark]")).toHaveLength(3);
    expect(screen.getAllByText("6 cm").length).toBeGreaterThanOrEqual(3);
    expect(screen.queryByText("Przesuń wierzchołek bez przeciągania")).not.toBeInTheDocument();
    expect(screen.queryByText(/√/u)).not.toBeInTheDocument();
  });

  it("zmienia kształt i długości po wybraniu nazwy trójkąta", () => {
    const onStateChange = vi.fn();
    const { container } = render(<GeometryLab seed={460101} onStateChange={onStateChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Trójkąt różnoboczny" }));
    expect(onStateChange).toHaveBeenCalled();
    expect(screen.getAllByText("3 cm").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("4 cm").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("5 cm").length).toBeGreaterThanOrEqual(1);
    expect(container.querySelectorAll("[data-equal-side-mark]")).toHaveLength(0);

    fireEvent.click(screen.getByRole("button", { name: "Trójkąt równoramienny" }));
    expect(screen.getAllByText("5 cm").length).toBeGreaterThanOrEqual(2);
    expect(container.querySelectorAll("[data-equal-side-mark]")).toHaveLength(2);
  });

  it("blokuje manipulację w widoku tylko do odczytu", () => {
    render(<GeometryLab seed={460101} readOnly />);
    expect(screen.getByRole("button", { name: "Następne zadanie →" })).toBeDisabled();
    expect(screen.queryByRole("button", { name: /Wierzchołek C/u })).not.toBeInTheDocument();
  });
});
