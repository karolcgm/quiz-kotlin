/** @vitest-environment jsdom */
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
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

  it("pozwala przełączać zadania i zawiera przykład z różnymi jednostkami boków", () => {
    render(<RectangleSquareAreaLab activity="area-calculations" />);

    const next = screen.getByRole("button", { name: "Następne →" });
    fireEvent.click(next);
    expect(screen.getByText("Zadanie 2/10")).toBeInTheDocument();
    expect(screen.getByText(/Kwadrat ma bok długości 9 mm/u)).toBeInTheDocument();

    fireEvent.click(next);
    fireEvent.click(next);
    fireEvent.click(next);
    expect(screen.getByText("Zadanie 5/10")).toBeInTheDocument();
    expect(screen.getByText(/5 cm i 72 mm/u)).toBeInTheDocument();

    const keypad = screen.getByLabelText("Kalkulator do pola");
    "3600".split("").forEach((digit) => fireEvent.click(within(keypad).getByRole("button", { name: digit })));
    fireEvent.click(within(keypad).getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByRole("status")).toHaveTextContent("3600 mm²");
  });

  it("zawiera rozbudowaną serię zadań tekstowych oraz zadanie łączące pole z obwodem", () => {
    render(<RectangleSquareAreaLab activity="area-stories" />);

    expect(screen.getByText("Zadanie 1/10")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /Prostokątny szkolny ogródek/u })).toHaveAttribute(
      "src",
      expect.stringContaining("story-garden.png"),
    );
    expect(screen.getByText(/Samodzielnie zdecyduj/u)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Następne →" }));
    expect(screen.getByText("Zadanie 2/10")).toBeInTheDocument();
    expect(screen.getByText(/2 m i szerokości 150 cm/u)).toBeInTheDocument();
  });

  it("zaczyna zadania tekstowe od pierwszego zadania po opuszczeniu zadania 10 z obliczeń", () => {
    const { rerender } = render(<RectangleSquareAreaLab activity="area-calculations" />);
    const next = screen.getByRole("button", { name: "Następne →" });

    for (let index = 0; index < 9; index += 1) fireEvent.click(next);
    expect(screen.getByText("Zadanie 10/10")).toBeInTheDocument();

    rerender(<RectangleSquareAreaLab activity="area-stories" />);

    expect(screen.getByText("Zadanie 1/10")).toBeInTheDocument();
    expect(screen.getByText(/Szkolny ogródek ma kształt prostokąta/u)).toBeInTheDocument();
  });
});
