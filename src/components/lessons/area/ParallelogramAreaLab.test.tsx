/** @vitest-environment jsdom */
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ParallelogramAreaLab } from "@/components/lessons/area/ParallelogramAreaLab";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("ParallelogramAreaLab", () => {
  it("uczy wzoru i pokazuje wysokość prostopadłą do podstawy", () => {
    render(<ParallelogramAreaLab activity="area-formula" />);

    expect(screen.getByRole("heading", { name: "Wzór na pole równoległoboku" })).toBeInTheDocument();
    expect(screen.getByText("P = a · h")).toBeInTheDocument();
    expect(screen.getByText(/łuk z kropką/u)).toBeInTheDocument();
  });

  it("pozwala wybrać podstawę i dwa końce odpowiadającej wysokości", () => {
    vi.useFakeTimers();
    render(<ParallelogramAreaLab activity="base-height" />);

    expect(screen.getByText("Zadanie 1/6")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Wybierz odcinek AB jako podstawę" }));
    fireEvent.click(screen.getByRole("button", { name: "Wybierz punkt D" }));
    fireEvent.click(screen.getByRole("button", { name: "Wybierz punkt na prostej" }));
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź wskazanie" }));

    expect(screen.getByRole("status")).toHaveTextContent("Wysokość jest prostopadła");
    act(() => vi.advanceTimersByTime(750));
    expect(screen.getByText("Zadanie 2/6")).toBeInTheDocument();
  });

  it("prowadzi jedną serię obliczeń i blokuje klawiaturę systemową", () => {
    vi.useFakeTimers();
    render(<ParallelogramAreaLab activity="area-calculations" />);

    expect(screen.getByText("Zadanie 1/12")).toBeInTheDocument();
    const answer = screen.getByLabelText("Pole równoległoboku");
    expect(answer).toHaveAttribute("inputmode", "none");
    expect(answer).toHaveAttribute("readonly");

    fireEvent.click(screen.getByRole("button", { name: "2" }));
    fireEvent.click(screen.getByRole("button", { name: "8" }));
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByRole("status")).toHaveTextContent("Dobrze");

    act(() => vi.advanceTimersByTime(700));
    expect(screen.getByText("Zadanie 2/12")).toBeInTheDocument();
    expect(screen.getByText("b = 5 cm")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "2" }));
    fireEvent.click(screen.getByRole("button", { name: "4" }));
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
    act(() => vi.advanceTimersByTime(700));

    expect(screen.getByText("Zadanie 3/12")).toBeInTheDocument();
    const convertedHeight = screen.getByLabelText("Wysokość po zamianie");
    const convertedArea = screen.getByLabelText("Pole równoległoboku");
    expect(convertedHeight).toHaveAttribute("inputmode", "none");
    expect(convertedHeight).toHaveAttribute("readonly");
    expect(convertedArea).toHaveAttribute("inputmode", "none");
    expect(convertedArea).toHaveAttribute("readonly");

    fireEvent.click(screen.getByRole("button", { name: "4" }));
    fireEvent.click(convertedArea);
    fireEvent.click(screen.getByRole("button", { name: "2" }));
    fireEvent.click(screen.getByRole("button", { name: "4" }));
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByRole("status")).toHaveTextContent("40 mm = 4 cm");
  });

  it("na tablecie przyciąga dotknięcia do siatki i zamyka figurę po dotknięciu pierwszego punktu", () => {
    render(<ParallelogramAreaLab activity="area-stories" />);

    expect(screen.getByText("Zadanie 1/8")).toBeInTheDocument();
    const grid = screen.getByRole("img", { name: "Kratownica do szkicu. Dotknij, aby dodać punkt przyciągany do siatki" });
    vi.spyOn(grid, "getBoundingClientRect").mockReturnValue({
      x: 0,
      y: 0,
      left: 0,
      top: 0,
      right: 700,
      bottom: 330,
      width: 700,
      height: 330,
      toJSON: () => ({}),
    });

    const baseLabel = screen.getByRole("button", { name: "Wstaw „a = 8 m”" });
    const heightLabel = screen.getByRole("button", { name: "Wstaw „h = 3 m”" });
    expect(baseLabel).toBeDisabled();
    expect(heightLabel).toBeDisabled();

    const tapGrid = (clientX: number, clientY: number) => {
      fireEvent(grid, new MouseEvent("pointerdown", { bubbles: true, cancelable: true, clientX, clientY }));
    };

    tapGrid(53, 52);
    tapGrid(303, 52);
    tapGrid(353, 202);
    tapGrid(103, 202);

    expect(grid.querySelectorAll("[data-sketch-vertex='true']")).toHaveLength(4);
    expect(grid.querySelector("[data-sketch-polyline='true']")).toHaveAttribute("points", "50,50 300,50 350,200 100,200");
    expect(grid).toHaveAttribute("data-sketch-closed", "false");

    tapGrid(51, 49);

    expect(grid).toHaveAttribute("data-sketch-closed", "true");
    expect(grid.querySelector("[data-sketch-polygon='true']")).toHaveAttribute("points", "50,50 300,50 350,200 100,200");
    expect(screen.getByRole("status")).toHaveTextContent("Figura jest zamknięta");
    expect(baseLabel).toBeEnabled();
    expect(heightLabel).toBeEnabled();

    const answer = screen.getByLabelText("Pole kwietnika");
    expect(answer).toHaveAttribute("inputmode", "none");
    expect(answer).toHaveAttribute("readonly");
  });
});
