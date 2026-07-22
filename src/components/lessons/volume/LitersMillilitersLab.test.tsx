/** @vitest-environment jsdom */
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LitersMillilitersLab, litersMillilitersActivityFromStageId } from "@/components/lessons/volume";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("LitersMillilitersLab", () => {
  it("wyjaśnia związek objętości bryły z litrami i mililitrami", () => {
    render(<LitersMillilitersLab activity="meaning" />);

    expect(screen.getByText("1 dm³ = 1 l")).toBeInTheDocument();
    expect(screen.getByText("1 cm³ = 1 ml")).toBeInTheDocument();
    expect(screen.getByText("1000 ml = 1 l")).toBeInTheDocument();
  });

  it("pokazuje na miarce tę samą ilość wody w ml, cm³ i litrach", () => {
    render(<LitersMillilitersLab activity="measuring-cup" />);

    fireEvent.change(screen.getByLabelText("Ilość wody w miarce"), { target: { value: "750" } });
    expect(screen.getByText(/750 ml = 750 cm/u)).toBeInTheDocument();
    expect(screen.getByText("0,75 l")).toBeInTheDocument();
  });

  it("prowadzi serię zamian od zadania pierwszego przez klawiaturę ekranową", () => {
    vi.useFakeTimers();
    render(<LitersMillilitersLab activity="conversions" />);

    expect(screen.getByText("Zadanie 1/10")).toBeInTheDocument();
    const input = screen.getByLabelText("Wynik zamiany");
    expect(input).toHaveAttribute("inputmode", "none");
    expect(input).toHaveAttribute("readonly");
    fireEvent.click(screen.getByRole("button", { name: "1" }));
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByRole("status")).toHaveTextContent("Dobrze");
    act(() => vi.advanceTimersByTime(750));
    expect(screen.getByText("Zadanie 2/10")).toBeInTheDocument();
  });

  it("daje zadania praktyczne z jednym miejscem na wynik", () => {
    render(<LitersMillilitersLab activity="practical-tasks" />);

    expect(screen.getByText("Dzbanek z wodą")).toBeInTheDocument();
    const input = screen.getByLabelText("Wynik zadania tekstowego");
    expect(input).toHaveAttribute("inputmode", "none");
    expect(input).toHaveAttribute("readonly");
  });

  it("mapuje cztery slajdy tematu na właściwe aktywności", () => {
    expect(litersMillilitersActivityFromStageId("m5-8-3-litry-mililitry-v2-s1")).toBe("meaning");
    expect(litersMillilitersActivityFromStageId("m5-8-3-litry-mililitry-v2-s2")).toBe("measuring-cup");
    expect(litersMillilitersActivityFromStageId("m5-8-3-litry-mililitry-v2-s3")).toBe("conversions");
    expect(litersMillilitersActivityFromStageId("m5-8-3-litry-mililitry-v2-s4")).toBe("practical-tasks");
  });
});
