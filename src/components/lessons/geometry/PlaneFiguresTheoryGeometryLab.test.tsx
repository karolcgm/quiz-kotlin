// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { GeometryLab } from "@/components/lessons/geometry/GeometryLab";
import { PLANE_FIGURES_REVIEW_SEEDS } from "@/lib/math/geometry/planeFiguresTheory";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("Teoria figur na płaszczyźnie", () => {
  it("pokazuje pełną klasyfikację kątów od 0° do 360°", () => {
    render(<GeometryLab seed={490001} />);
    expect(screen.getByText("Pełna rodzina kątów")).toBeInTheDocument();
    expect(screen.getByText(/Kąt zerowy ma 0°/u)).toBeInTheDocument();
    expect(screen.getAllByText(/wklęsły/u).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/pełny — 360°/u).length).toBeGreaterThan(0);
  });

  it("sprawdza odpowiedź i przekazuje poprawny wynik", () => {
    vi.useFakeTimers();
    const onResultChange = vi.fn();
    render(<GeometryLab seed={490101} onResultChange={onResultChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Prostokąt" }));
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
    act(() => vi.advanceTimersByTime(650));
    fireEvent.click(screen.getByRole("button", { name: "Kwadrat" }));
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
    act(() => vi.advanceTimersByTime(650));
    fireEvent.click(screen.getByRole("button", { name: "Jest kwadratem i prostokątem" }));
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
    expect(onResultChange).toHaveBeenLastCalledWith(true, "ukończono 3 zadania: Własności prostokąta i kwadratu");
  });

  it("ma 22 różne zadania powtórzeniowe bez ponownego wykładu", () => {
    const titles = PLANE_FIGURES_REVIEW_SEEDS.map((seed) => {
      const { unmount } = render(<GeometryLab seed={seed} />);
      const title = document.querySelector("[data-plane-figures-theory] h3")?.textContent;
      expect(screen.queryByText("Najpierw poznaj własności")).not.toBeInTheDocument();
      expect(document.querySelector("[data-plane-figures-theory] svg")).not.toBeInTheDocument();
      unmount();
      return title;
    });
    expect(new Set(titles).size).toBe(22);
  });

  it("blokuje wybór i zatwierdzanie w trybie tylko do odczytu", () => {
    render(<GeometryLab seed={490301} readOnly />);
    expect(screen.getByRole("button", { name: "Boki równoległe" })).toBeDisabled();
    expect(screen.queryByRole("button", { name: "Zatwierdź" })).not.toBeInTheDocument();
  });
});
