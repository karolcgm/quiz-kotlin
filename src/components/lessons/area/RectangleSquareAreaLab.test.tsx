/** @vitest-environment jsdom */
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RectangleSquareAreaLab } from "@/components/lessons/area/RectangleSquareAreaLab";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("RectangleSquareAreaLab", () => {
  it("wyjaśnia pole przez wnętrze figury i pokazuje kwadraty jednostkowe", () => {
    render(<RectangleSquareAreaLab activity="area-definition" />);

    expect(screen.getByRole("heading", { name: "Co to jest pole?" })).toBeInTheDocument();
    expect(screen.getByText("Pole to wnętrze figury")).toBeInTheDocument();
    expect(screen.getByText("Kwadrat jednostkowy 1 mm²")).toBeInTheDocument();
    expect(screen.getByText("Kwadrat jednostkowy 1 cm²")).toBeInTheDocument();
  });

  it("zaznacza na kratownicy pole zgodne z ustawioną długością i szerokością", () => {
    const { container } = render(<RectangleSquareAreaLab activity="area-grid" />);

    expect(container.querySelectorAll('[data-area-cell="active"]')).toHaveLength(24);
    fireEvent.change(screen.getByLabelText("Długość prostokąta"), { target: { value: "7" } });
    fireEvent.change(screen.getByLabelText("Szerokość prostokąta"), { target: { value: "6" } });

    expect(container.querySelectorAll('[data-area-cell="active"]')).toHaveLength(42);
    expect(screen.getByText("P = 7 · 6 = 42")).toBeInTheDocument();
  });

  it("pokazuje komplet podstawowych jednostek pola", () => {
    render(<RectangleSquareAreaLab activity="area-formulas" />);

    expect(screen.getByLabelText("Podstawowe jednostki pola")).toBeInTheDocument();
    ["mm²", "cm²", "dm²", "m²", "km²"].forEach((unit) => {
      expect(screen.getByText(unit)).toBeInTheDocument();
    });
    expect(screen.getByText("kilometr kwadratowy")).toBeInTheDocument();
  });

  it("utrzymuje jedną serię zadań, blokuje klawiaturę systemową i przechodzi dalej po poprawnej odpowiedzi", () => {
    vi.useFakeTimers();
    render(<RectangleSquareAreaLab activity="area-calculations" />);

    expect(screen.getByText("Zadanie 1/10")).toBeInTheDocument();
    const answer = screen.getByLabelText("Pole prostokąta");
    expect(answer).toHaveAttribute("inputmode", "none");
    expect(answer).toHaveAttribute("readonly");

    fireEvent.click(screen.getByRole("button", { name: "3" }));
    fireEvent.click(screen.getByRole("button", { name: "5" }));
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByRole("status")).toHaveTextContent("35 cm²");

    act(() => vi.advanceTimersByTime(700));
    expect(screen.getByText("Zadanie 2/10")).toBeInTheDocument();
    expect(screen.getByText(/Kwadrat ma bok długości 9 mm/u)).toBeInTheDocument();
  });

  it("zawiera rozbudowaną serię zadań tekstowych oraz zadanie łączące pole z obwodem", () => {
    render(<RectangleSquareAreaLab activity="area-stories" />);

    expect(screen.getByText("Zadanie 1/10")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /Szkolny ogródek/u })).toBeInTheDocument();
    expect(screen.getByText(/Samodzielnie zdecyduj/u)).toBeInTheDocument();
  });
});
