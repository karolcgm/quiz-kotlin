/** @vitest-environment jsdom */
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { VolumeUnitsLab, volumeUnitsActivityFromStageId } from "@/components/lessons/volume";

vi.mock("@react-three/fiber", () => ({
  Canvas: ({ fallback }: { fallback?: ReactNode }) => <div data-testid="volume-canvas">{fallback}</div>,
}));

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("VolumeUnitsLab", () => {
  it("pokazuje w klasie VI model 3D i właściwy numer działu", () => {
    render(<VolumeUnitsLab activity="definition" eyebrow="Dział 9 · Temat 5" useSpatialModel />);

    expect(screen.getByText("Dział 9 · Temat 5")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Model 3D bryły z 36 sześcianów jednostkowych" })).toHaveAttribute("data-model-position", "raised");
    expect(screen.getByTestId("volume-canvas")).toBeInTheDocument();
  });

  it("wyjaśnia objętość przez wnętrze bryły i pokazuje pięć jednostek sześciennych", () => {
    render(<VolumeUnitsLab activity="definition" />);

    expect(screen.getByRole("heading", { name: "Co to jest objętość?" })).toBeInTheDocument();
    expect(screen.getByText(/ile mieści się w bryle/u)).toBeInTheDocument();
    expect(screen.getByLabelText("Podstawowe jednostki objętości")).toBeInTheDocument();
    ["mm³", "cm³", "dm³", "m³", "km³"].forEach((unit) => expect(screen.getByText(`1 ${unit}`)).toBeInTheDocument());
  });

  it("zmienia trzy wymiary bryły i aktualizuje jej objętość", () => {
    render(<VolumeUnitsLab activity="solid-builder" />);

    expect(screen.getByText("V = 10 · 10 · 10 = 1000 cm³")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Długość bryły"), { target: { value: "3" } });
    fireEvent.change(screen.getByLabelText("Szerokość bryły"), { target: { value: "4" } });
    fireEvent.change(screen.getByLabelText("Wysokość bryły"), { target: { value: "2" } });
    expect(screen.getByText("V = 3 · 4 · 2 = 24 cm³")).toBeInTheDocument();
  });

  it("prowadzi serię klocków od pierwszego zadania przez klawiaturę lekcyjną", () => {
    vi.useFakeTimers();
    render(<VolumeUnitsLab activity="unit-cubes" />);

    expect(screen.getByText("Zadanie 1/10")).toBeInTheDocument();
    const answer = screen.getByLabelText("Objętość bryły z klocków");
    expect(answer).toHaveAttribute("inputmode", "none");
    expect(answer).toHaveAttribute("readonly");
    fireEvent.click(screen.getByRole("button", { name: "1" }));
    fireEvent.click(screen.getByRole("button", { name: "2" }));
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByRole("status")).toHaveTextContent("12 klocków");
    act(() => vi.advanceTimersByTime(750));
    expect(screen.getByText("Zadanie 2/10")).toBeInTheDocument();
  });

  it("dobiera jednostkę objętości do kropli, wanny i Bałtyku", () => {
    vi.useFakeTimers();
    render(<VolumeUnitsLab activity="capacity-match" />);

    expect(screen.getByText("Zadanie 1/5")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "mm³" }));
    expect(screen.getByRole("status")).toHaveTextContent("kropla wody");
    act(() => vi.advanceTimersByTime(750));
    expect(screen.getByText("Zadanie 2/5")).toBeInTheDocument();
  });

  it("mapuje cztery slajdy tematu na właściwe aktywności", () => {
    expect(volumeUnitsActivityFromStageId("m5-8-1-szesian-jednostkowy-v1-s1")).toBe("definition");
    expect(volumeUnitsActivityFromStageId("m5-8-1-szesian-jednostkowy-v1-s2")).toBe("solid-builder");
    expect(volumeUnitsActivityFromStageId("m5-8-1-szesian-jednostkowy-v1-s3")).toBe("unit-cubes");
    expect(volumeUnitsActivityFromStageId("m5-8-1-szesian-jednostkowy-v1-s4")).toBe("capacity-match");
  });
});
