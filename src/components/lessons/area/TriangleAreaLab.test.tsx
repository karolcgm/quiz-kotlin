/** @vitest-environment jsdom */
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TriangleAreaLab } from "@/components/lessons/area/TriangleAreaLab";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("TriangleAreaLab", () => {
  it("pozwala wskazać podstawę oraz odpowiadającą jej wysokość", () => {
    render(<TriangleAreaLab activity="base-height" />);

    fireEvent.click(screen.getByRole("button", { name: "Wybierz odcinek AB jako podstawę" }));
    fireEvent.click(screen.getByRole("button", { name: "Wybierz punkt C" }));
    fireEvent.click(screen.getByRole("button", { name: "Wybierz punkt na prostej" }));
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź wskazanie" }));

    expect(screen.getByRole("status")).toHaveTextContent("Wysokość jest prostopadła do wybranej podstawy");
  });

  it("pokazuje wzór na pole trójkąta z wysokością", () => {
    render(<TriangleAreaLab activity="area-formula" />);

    expect(screen.getByRole("heading", { name: "Wzór na pole trójkąta" })).toBeInTheDocument();
    expect(screen.getByText("P = a · h : 2")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Trójkąt z podstawą i wysokością" })).toBeInTheDocument();
  });

  it("prowadzi jedną serię obliczeń i używa wyłącznie klawiatury lekcyjnej", () => {
    vi.useFakeTimers();
    render(<TriangleAreaLab activity="area-calculations" />);

    expect(screen.getByText("Zadanie 1/12")).toBeInTheDocument();
    const answer = screen.getByLabelText("Pole trójkąta");
    expect(answer).toHaveAttribute("inputmode", "none");
    expect(answer).toHaveAttribute("readonly");

    fireEvent.click(screen.getByRole("button", { name: "3" }));
    fireEvent.click(screen.getByRole("button", { name: "0" }));
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByRole("status")).toHaveTextContent("10 · 6 : 2 = 30");

    act(() => vi.advanceTimersByTime(700));
    expect(screen.getByText("Zadanie 2/12")).toBeInTheDocument();
  });

  it("zaczyna zadania tekstowe od pierwszego zadania i pokazuje szkicownik", () => {
    render(<TriangleAreaLab activity="area-stories" />);

    expect(screen.getByText("Zadanie 1/8")).toBeInTheDocument();
    expect(screen.getByText(/Rabata ma kształt trójkąta/u)).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /Kratownica do szkicu trójkąta/u })).toBeInTheDocument();
  });
});
