/** @vitest-environment jsdom */
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CuboidVolumeLab, cuboidVolumeActivityFromStageId } from "@/components/lessons/volume";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("CuboidVolumeLab", () => {
  it("pokazuje osobne wzory i rysunki prostopadłościanu oraz sześcianu", () => {
    render(<CuboidVolumeLab activity="formulas" />);

    expect(screen.getByRole("heading", { name: "Objętość prostopadłościanu i sześcianu" })).toBeInTheDocument();
    expect(screen.getByText("Prostopadłościan")).toBeInTheDocument();
    expect(screen.getByText("Sześcian")).toBeInTheDocument();
    expect(screen.getByText("V = a · b · c")).toBeInTheDocument();
    expect(screen.getByText(/V = a · a · a = a/u)).toBeInTheDocument();
  });

  it("prowadzi serię brył opisanych przy krawędziach od zadania pierwszego", () => {
    vi.useFakeTimers();
    render(<CuboidVolumeLab activity="pictured-solids" />);

    expect(screen.getByText("Zadanie 1/6")).toBeInTheDocument();
    const answer = screen.getByLabelText("Objętość bryły");
    expect(answer).toHaveAttribute("inputmode", "none");
    expect(answer).toHaveAttribute("readonly");
    fireEvent.click(screen.getByRole("button", { name: "2" }));
    fireEvent.click(screen.getByRole("button", { name: "4" }));
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByRole("status")).toHaveTextContent("24 cm³");
    act(() => vi.advanceTimersByTime(750));
    expect(screen.getByText("Zadanie 2/6")).toBeInTheDocument();
  });

  it("udostępnia obliczenia z samych wymiarów, przecinkiem dziesiętnym i bez rysunku", () => {
    render(<CuboidVolumeLab activity="dimensions-only" />);

    expect(screen.getByText("Zadanie 1/6")).toBeInTheDocument();
    expect(screen.getByText("a = 0,2 cm, b = 3 cm, c = 2 cm")).toBeInTheDocument();
    expect(screen.queryByRole("img", { name: /wymiary prostopadłościanu/u })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "1" }));
    fireEvent.click(screen.getByRole("button", { name: ", przecinek" }));
    fireEvent.click(screen.getByRole("button", { name: "2" }));
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByRole("status")).toHaveTextContent("1,2 cm³");
  });

  it("daje w zadaniu tekstowym cztery aktywne pola obsługiwane wyłącznie klawiaturą lekcyjną", () => {
    render(<CuboidVolumeLab activity="word-problems" />);

    ["długość", "szerokość", "wysokość", "objętość"].forEach((label) => {
      const input = screen.getByLabelText(label);
      expect(input).toHaveAttribute("inputmode", "none");
      expect(input).toHaveAttribute("readonly");
    });
    expect(screen.getByAltText("Prostokątne pudełko i kolorowe kredki")).toBeInTheDocument();
  });

  it("mapuje cztery slajdy tematu na właściwe aktywności", () => {
    expect(cuboidVolumeActivityFromStageId("m5-8-2-objetosc-prostopadloscianu-v2-s1")).toBe("formulas");
    expect(cuboidVolumeActivityFromStageId("m5-8-2-objetosc-prostopadloscianu-v2-s2")).toBe("pictured-solids");
    expect(cuboidVolumeActivityFromStageId("m5-8-2-objetosc-prostopadloscianu-v2-s3")).toBe("dimensions-only");
    expect(cuboidVolumeActivityFromStageId("m5-8-2-objetosc-prostopadloscianu-v2-s4")).toBe("word-problems");
  });
});
