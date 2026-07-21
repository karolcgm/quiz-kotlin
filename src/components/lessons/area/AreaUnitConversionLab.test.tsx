/** @vitest-environment jsdom */
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AreaUnitConversionLab } from "@/components/lessons/area/AreaUnitConversionLab";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("AreaUnitConversionLab", () => {
  it("pokazuje kierunek i mnożniki dla jednostek długości", () => {
    render(<AreaUnitConversionLab activity="length-relations" />);

    expect(screen.getByRole("heading", { name: "Zależności między jednostkami długości" })).toBeInTheDocument();
    expect(screen.getByText("kilometr")).toBeInTheDocument();
    expect(screen.getByText("milimetr")).toBeInTheDocument();
    expect(screen.getByText("1 km = 1000 m")).toBeInTheDocument();
    expect(screen.getByText("1 cm = 10 mm")).toBeInTheDocument();
    expect(screen.getByText("3 m = 3 · 100 cm = 300 cm")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "← Do większej jednostki" }));
    expect(screen.getByText("560 cm = 560 : 100 m = 5,6 m")).toBeInTheDocument();
  });

  it("pokazuje hektar, ar i zasadę razy 100 dla jednostek pola", () => {
    render(<AreaUnitConversionLab activity="area-relations" />);

    expect(screen.getByRole("heading", { name: "Zależności między jednostkami pola" })).toBeInTheDocument();
    expect(screen.getByText("1 ha = 100 a = 10 000 m²")).toBeInTheDocument();
    expect(screen.getByText("1 a = 100 m²")).toBeInTheDocument();
    expect(screen.getAllByLabelText(/razy 100/u).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: "← Do większej jednostki" }));
    expect(screen.getByText("750 a = 750 : 100 ha = 7,5 ha")).toBeInTheDocument();
  });

  it("prowadzi jedną serię zadań długości i blokuje klawiaturę systemową", () => {
    vi.useFakeTimers();
    render(<AreaUnitConversionLab activity="length-conversions" />);

    expect(screen.getByText("Zadanie 1/10")).toBeInTheDocument();
    const answer = screen.getByLabelText("Wynik zamiany jednostki");
    expect(answer).toHaveAttribute("inputmode", "none");
    expect(answer).toHaveAttribute("readonly");

    fireEvent.click(screen.getByRole("button", { name: "3" }));
    fireEvent.click(screen.getByRole("button", { name: "0" }));
    fireEvent.click(screen.getByRole("button", { name: "0" }));
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByRole("status")).toHaveTextContent("3 · 100 = 300");

    act(() => vi.advanceTimersByTime(700));
    expect(screen.getByText("Zadanie 2/10")).toBeInTheDocument();
    expect(screen.getByLabelText("45 cm równa się ile mm")).toBeInTheDocument();
  });

  it("tworzy osobną serię dwunastu zadań wyłącznie na zamianę jednostek pola", () => {
    render(<AreaUnitConversionLab activity="area-conversions" />);

    expect(screen.getByText("Zadanie 1/12")).toBeInTheDocument();
    expect(screen.getByLabelText("3 m² równa się ile dm²")).toBeInTheDocument();
    expect(screen.queryByText(/ogród/u)).not.toBeInTheDocument();
  });
});
