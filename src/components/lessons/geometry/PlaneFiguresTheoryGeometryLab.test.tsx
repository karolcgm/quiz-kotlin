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

  it("pokazuje osobne duże rysunki kątów odpowiadających i naprzemianległych nad opisami", () => {
    render(<GeometryLab seed={490051} />);
    expect(screen.getByRole("heading", { level: 2, name: "Kąty odpowiadające i naprzemianległe" })).toBeInTheDocument();
    expect(document.querySelector('[data-parallel-angle-diagram="corresponding"]')).toBeInTheDocument();
    expect(document.querySelector('[data-parallel-angle-diagram="alternate"]')).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Kąty odpowiadające" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Kąty naprzemianległe" })).toBeInTheDocument();
    expect(screen.getAllByText("prosta c")).toHaveLength(2);
    expect(document.body.textContent).not.toMatch(/sieczn/iu);
  });

  it("sprawdza nazwy czterech rodzajów par kątów w jednej serii", () => {
    vi.useFakeTimers();
    const onResultChange = vi.fn();
    render(<GeometryLab seed={490053} onResultChange={onResultChange} />);
    expect(screen.getByRole("heading", { level: 2, name: "Rozpoznawanie par kątów" })).toBeInTheDocument();

    for (const name of [
      "Kąty przyległe",
      "Kąty wierzchołkowe",
      "Kąty odpowiadające",
      "Kąty naprzemianległe",
      "Kąty odpowiadające",
      "Kąty naprzemianległe",
      "Kąty odpowiadające",
    ]) {
      fireEvent.click(screen.getByRole("button", { name }));
      fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
      act(() => vi.advanceTimersByTime(700));
    }

    expect(onResultChange).toHaveBeenLastCalledWith(true, "rozpoznano wszystkie pary kątów");
  });

  it("oblicza miary kątów odpowiadających i naprzemianległych w jednej serii", () => {
    vi.useFakeTimers();
    const onResultChange = vi.fn();
    render(<GeometryLab seed={490052} onResultChange={onResultChange} />);

    expect(screen.getByText("Oblicz miarę kąta α. Proste a i b są równoległe.")).toBeInTheDocument();
    expect(screen.getByText("Zadanie 1/8")).toBeInTheDocument();
    expect(screen.getByLabelText("Miara kąta alfa")).toHaveAttribute("inputmode", "none");
    expect(screen.getByLabelText("Miara kąta alfa")).toHaveAttribute("readonly");

    [100, 70, 58, 120, 135, 46, 82, 105].forEach((answer, index, answers) => {
      for (const digit of String(answer)) {
        fireEvent.click(screen.getAllByRole("button", { name: digit })[0]!);
      }
      fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
      expect(screen.getByRole("status")).toHaveTextContent("Dobrze");
      act(() => vi.advanceTimersByTime(850));
      if (index < answers.length - 1) {
        expect(screen.getByText(`Zadanie ${index + 2}/8`)).toBeInTheDocument();
      }
    });

    expect(onResultChange).toHaveBeenLastCalledWith(true, "obliczono wszystkie miary kątów");
  });
});
