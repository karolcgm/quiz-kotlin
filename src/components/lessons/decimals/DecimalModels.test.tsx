/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { DecimalHundredGrid } from "@/components/lessons/decimals/DecimalHundredGrid";
import { DecimalNumberLine } from "@/components/lessons/decimals/DecimalNumberLine";

afterEach(cleanup);

function GridHarness() {
  const [shaded, setShaded] = useState(37);
  return <DecimalHundredGrid shaded={shaded} onChange={setShaded} />;
}

describe("DecimalNumberLine", () => {
  it("nakłada równoważne zera końcowe na ten sam punkt i ma tekstową tabelę SVG", () => {
    const { container } = render(<DecimalNumberLine minimum="2" maximum="3" points={[
      { id: "short", value: "2,5", label: "2,5", symbol: "A" },
      { id: "long", value: "2,50", label: "2,50", symbol: "B" },
    ]} />);
    const short = container.querySelector('[data-decimal-point="short"]')!;
    const long = container.querySelector('[data-decimal-point="long"]')!;
    expect(short.getAttribute("data-point-x")).toBe(long.getAttribute("data-point-x"));
    expect(screen.getByRole("img", { name: /Oś liczb dziesiętnych.*równych wartościach/u })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Zapis" })).toBeInTheDocument();
  });
});

describe("DecimalHundredGrid", () => {
  it("renderuje 100 dostępnych pól i synchronizuje ułamek ze śladem dziesiętnym", () => {
    render(<GridHarness />);
    expect(screen.getAllByRole("gridcell")).toHaveLength(100);
    expect(screen.getByText("37/100 = 0,37")).toBeInTheDocument();
    expect(screen.getAllByRole("gridcell", { selected: true })).toHaveLength(37);
  });

  it("obsługuje touch/rysik i alternatywę liczbową bez precyzyjnego malowania", () => {
    render(<GridHarness />);
    const cell38 = screen.getByRole("gridcell", { name: "Pole 38, niezaznaczone" });
    fireEvent.pointerDown(cell38, { pointerType: "pen", pointerId: 9, button: 0 });
    fireEvent.click(cell38);
    expect(screen.getByText("38/100 = 0,38")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Liczba zaznaczonych pól"), { target: { value: "25" } });
    expect(screen.getByText("25/100 = 0,25")).toBeInTheDocument();
  });
});
