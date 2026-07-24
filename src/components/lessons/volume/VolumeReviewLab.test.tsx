/** @vitest-environment jsdom */
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { VolumeReviewLab, volumeReviewActivityFromStageId } from "@/components/lessons/volume";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("VolumeReviewLab", () => {
  it("rozpoczyna serię brył od zadania 1 i przechodzi do kolejnego po poprawnej odpowiedzi", () => {
    vi.useFakeTimers();
    render(<VolumeReviewLab activity="unit-cubes" />);

    expect(screen.getByText("Zadanie 1/6")).toBeInTheDocument();
    const input = screen.getByLabelText("Objętość bryły");
    expect(input).toHaveAttribute("inputmode", "none");
    expect(input).toHaveAttribute("readonly");

    fireEvent.click(screen.getByRole("button", { name: "1" }));
    fireEvent.click(screen.getByRole("button", { name: "2" }));
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByRole("status")).toHaveTextContent("Dobrze");

    act(() => vi.advanceTimersByTime(750));
    expect(screen.getByText("Zadanie 2/6")).toBeInTheDocument();
  });

  it("udostępnia serię zamian z przecinkiem na klawiaturze ekranowej", () => {
    render(<VolumeReviewLab activity="conversions" />);

    expect(screen.getByText("Zadanie 1/8")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: ", przecinek" })).toBeInTheDocument();
    expect(screen.getByLabelText("Wynik")).toHaveAttribute("readonly");
  });

  it("pokazuje opis krawędzi sześcianu pod rysunkiem, a nie na bryle", () => {
    vi.useFakeTimers();
    render(<VolumeReviewLab activity="solid-volume" />);

    fireEvent.click(screen.getByRole("button", { name: "1" }));
    fireEvent.click(screen.getByRole("button", { name: "2" }));
    fireEvent.click(screen.getByRole("button", { name: "0" }));
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
    act(() => vi.advanceTimersByTime(750));

    expect(screen.getByText("Sześcian: każda krawędź ma długość 7 cm.")).toBeInTheDocument();
  });

  it("mapuje pięć slajdów powtórzenia na osobne serie zadań", () => {
    const prefix = "m5-8-r-powtorzenie-objetosc-v2";
    expect(volumeReviewActivityFromStageId(`${prefix}-s1`)).toBe("unit-cubes");
    expect(volumeReviewActivityFromStageId(`${prefix}-s2`)).toBe("solid-volume");
    expect(volumeReviewActivityFromStageId(`${prefix}-s3`)).toBe("conversions");
    expect(volumeReviewActivityFromStageId(`${prefix}-s4`)).toBe("stories");
    expect(volumeReviewActivityFromStageId(`${prefix}-s5`)).toBe("challenge");
  });
});
