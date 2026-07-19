/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { DecimalPowerTenL1Lab } from "@/components/lessons/decimals/DecimalPowerTenL1Lab";

afterEach(cleanup);

describe("DecimalPowerTenL1Lab — dzielenie przez potęgi 10", () => {
  it("pokazuje trzy przykłady przesunięcia przecinka w lewo ze znakiem dzielenia :", () => {
    render(<DecimalPowerTenL1Lab activity="divide10-position-shift" seed={556510} />);

    expect(screen.getByText(/Przesuwamy przecinek w lewo/u)).toBeInTheDocument();
    expect(screen.getByText((_, element) => element?.tagName === "P" && element.textContent === "56,7 : 10 = 5,67")).toBeInTheDocument();
    expect(screen.getByText((_, element) => element?.tagName === "P" && element.textContent === "56,7 : 100 = 0,567")).toBeInTheDocument();
    expect(screen.getByText((_, element) => element?.tagName === "P" && element.textContent === "56,7 : 1000 = 0,0567")).toBeInTheDocument();
  });

  it("animuje przecinek po kliknięciu przycisku", () => {
    const { container } = render(<DecimalPowerTenL1Lab activity="divide10-position-shift" seed={556510} />);

    fireEvent.click(screen.getAllByRole("button", { name: "Pokaż ruch przecinka" })[1]);

    expect(screen.getByText("Przecinek przesunął się w lewo o 2 miejsca.")).toBeInTheDocument();
    expect(container.querySelectorAll("[data-comma-animation='left']")).toHaveLength(3);
  });
});
