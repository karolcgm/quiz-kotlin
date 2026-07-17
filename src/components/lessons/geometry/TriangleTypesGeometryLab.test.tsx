// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
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

  it("rysuje plac zabaw, trzy kąty i jednakowe kreski na równych bokach", () => {
    const { container } = render(<GeometryLab seed={460101} />);
    expect(container.querySelector('[data-geometry-theme="playground"]')).toBeInTheDocument();
    expect(container.querySelectorAll("[data-geometry-angle]")).toHaveLength(3);
    expect(container.querySelectorAll("[data-equal-side-mark]").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByRole("button", { name: /Wierzchołek C/u })).toHaveAttribute("r", "26");
  });

  it("aktualizuje model strzałkami klawiatury i alternatywą bez przeciągania", () => {
    const onStateChange = vi.fn();
    render(<GeometryLab seed={460101} onStateChange={onStateChange} />);
    fireEvent.keyDown(screen.getByRole("button", { name: /Wierzchołek C/u }), { key: "ArrowRight" });
    expect(onStateChange).toHaveBeenCalled();
    const panel = screen.getByText("Przesuń wierzchołek bez przeciągania").closest("section") ?? document.body;
    fireEvent.click(within(panel).getByRole("button", { name: "←" }));
    expect(onStateChange.mock.calls.length).toBeGreaterThan(1);
  });

  it("blokuje manipulację w widoku tylko do odczytu", () => {
    render(<GeometryLab seed={460101} readOnly />);
    expect(screen.getByRole("button", { name: "Następne zadanie →" })).toBeDisabled();
    expect(screen.queryByRole("button", { name: /Wierzchołek C/u })).not.toBeInTheDocument();
  });
});
