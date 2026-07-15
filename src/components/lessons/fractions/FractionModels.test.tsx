/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { FractionBarModel } from "@/components/lessons/fractions/FractionBarModel";
import { FractionCircleModel } from "@/components/lessons/fractions/FractionCircleModel";
import { FractionGlassModel } from "@/components/lessons/fractions/FractionGlassModel";

afterEach(() => cleanup());

describe("dostępne modele wizualne ułamków", () => {
  it("renderuje paski o równych segmentach, nakładanie i wspólną oś z tabelą tekstową", () => {
    const { container } = render(
      <FractionBarModel
        overlay
        bars={[
          { id: "thirds", label: "Trzecie", value: { numerator: 1, denominator: 3 } },
          { id: "quarters", label: "Czwarte", value: { numerator: 2, denominator: 4 } },
        ]}
      />,
    );
    const thirds = [...container.querySelectorAll('[data-fraction-bar="thirds"] [data-segment-size]')];
    const quarters = [...container.querySelectorAll('[data-fraction-bar="quarters"] [data-segment-size]')];
    expect(new Set(thirds.map((node) => node.getAttribute("data-segment-size"))).size).toBe(1);
    expect(new Set(quarters.map((node) => node.getAttribute("data-segment-size"))).size).toBe(1);
    expect(screen.getByRole("img", { name: /Każda całość ma tę samą długość/u })).toBeInTheDocument();
    fireEvent.click(screen.getByText("Dane tekstowe modelu"));
    expect(screen.getByRole("table")).toHaveTextContent("Trzecie");
    expect(screen.getByRole("columnheader", { name: "Liczba równych części" })).toBeInTheDocument();
  });

  it("renderuje pizzę z równymi sektorami i jednoznacznym środkiem", () => {
    const { container } = render(<FractionCircleModel value={{ numerator: 7, denominator: 4 }} variant="pizza" />);
    const sectors = [...container.querySelectorAll("[data-sector-angle]")];
    expect(sectors).toHaveLength(8);
    expect(new Set(sectors.map((node) => node.getAttribute("data-sector-angle")))).toEqual(new Set(["90"]));
    expect(container.querySelectorAll("[data-common-center]")).toHaveLength(2);
    expect(screen.getByRole("img", { name: /wspólny środek/u })).toBeInTheDocument();
  });

  it("pokazuje poziom i podziałkę szklanki, przelewanie oraz zatrzymuje falę", () => {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: () => ({ matches: false, addEventListener() {}, removeEventListener() {} }),
    });
    const { container } = render(
      <FractionGlassModel
        glasses={[
          { id: "a", label: "Pierwsza", value: { numerator: 1, denominator: 3 } },
          { id: "b", label: "Wynik", value: { numerator: 7, denominator: 12 } },
        ]}
        pour={{ fromIds: ["a"], toId: "b", label: "Przelej do wyniku" }}
      />,
    );
    expect(container.querySelector('[data-fraction-glass="a"] [data-water-ratio]')).toHaveAttribute("data-water-ratio", String(1 / 3));
    expect(container.querySelectorAll('[data-fraction-glass="b"] [data-scale-tick]')).toHaveLength(13);
    expect(container.querySelector("[data-wave-amplitude]")).toHaveAttribute("data-wave-amplitude", "2.5");
    expect(container.querySelector("[data-wave-period]")).toHaveAttribute("data-wave-period", "3.6");
    expect(container.querySelector('[data-pour-connector="a:b"]')).toBeInTheDocument();

    const stop = screen.getByRole("button", { name: "Zatrzymaj ruch" });
    fireEvent.click(stop);
    expect(screen.getByRole("button", { name: "Wznów ruch" })).toHaveAttribute("aria-pressed", "true");
    expect(container.querySelector('[data-motion-paused="true"]')).toBeInTheDocument();
  });

  it("respektuje prefers-reduced-motion bez możliwości wymuszenia animacji", async () => {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: () => ({ matches: true, addEventListener() {}, removeEventListener() {} }),
    });
    const { container } = render(
      <FractionGlassModel glasses={[{ id: "a", label: "Woda", value: { numerator: 1, denominator: 4 } }]} />,
    );
    const motionButton = await screen.findByRole("button", { name: "Ruch zatrzymany" });
    expect(motionButton).toBeDisabled();
    expect(container.querySelector('[data-motion-paused="true"]')).toBeInTheDocument();
  });
});
