// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { GeometryLab } from "@/components/lessons/geometry/GeometryLab";
import { PLANE_FIGURES_REVIEW_SEEDS } from "@/lib/math/geometry/planeFiguresTheory";

afterEach(cleanup);

describe("Teoria figur na płaszczyźnie", () => {
  it("pokazuje pełną klasyfikację kątów od 0° do 360°", () => {
    render(<GeometryLab seed={490001} />);
    expect(screen.getByText("Pełna rodzina kątów")).toBeInTheDocument();
    expect(screen.getByText(/Kąt zerowy ma 0°/u)).toBeInTheDocument();
    expect(screen.getAllByText(/wklęsły/u).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/pełny — 360°/u).length).toBeGreaterThan(0);
  });

  it("sprawdza odpowiedź i przekazuje poprawny wynik", () => {
    const onResultChange = vi.fn();
    render(<GeometryLab seed={490101} onResultChange={onResultChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Cztery kąty proste" }));
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
    expect(onResultChange).toHaveBeenLastCalledWith(true, "Cztery kąty proste");
    expect(screen.getByRole("status")).toHaveTextContent("Dobrze");
  });

  it("ma dziesięć różnych zadań powtórzeniowych", () => {
    const titles = PLANE_FIGURES_REVIEW_SEEDS.map((seed) => {
      const { unmount } = render(<GeometryLab seed={seed} />);
      const title = document.querySelector("[data-plane-figures-theory] h3")?.textContent;
      unmount();
      return title;
    });
    expect(new Set(titles).size).toBe(10);
  });

  it("blokuje wybór i zatwierdzanie w trybie tylko do odczytu", () => {
    render(<GeometryLab seed={490301} readOnly />);
    expect(screen.getByRole("button", { name: "Boki równoległe" })).toBeDisabled();
    expect(screen.queryByRole("button", { name: "Zatwierdź" })).not.toBeInTheDocument();
  });
});
