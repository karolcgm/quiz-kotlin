/** @vitest-environment jsdom */
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { DecimalPowerTenL1Lab } from "@/components/lessons/decimals/DecimalPowerTenL1Lab";

afterEach(cleanup);

describe("DecimalPowerTenL1Lab — dzielenie przez potęgi 10", () => {
  it("pokazuje trzy przykłady przesunięcia przecinka w lewo ze znakiem dzielenia :", () => {
    render(<DecimalPowerTenL1Lab activity="divide10-position-shift" seed={556510} />);

    expect(screen.getByText(/Przesuwamy przecinek w lewo/u)).toBeInTheDocument();
    expect(screen.getByText("5,67")).toBeInTheDocument();
    expect(screen.getByText("0,567")).toBeInTheDocument();
    expect(screen.getByText("0,0567")).toBeInTheDocument();
    expect(screen.getAllByText(":")).toHaveLength(3);
  });
});
