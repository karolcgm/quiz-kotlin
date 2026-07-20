/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { DecimalEstimateL1Lab } from "@/components/lessons/decimals/DecimalEstimateL1Lab";

afterEach(cleanup);

describe("DecimalEstimateL1Lab", () => {
  it("nazywa błędne obliczenie wprost", () => {
    render(<DecimalEstimateL1Lab activity="decimal-estimate-sense" seed={561200} />);

    expect(screen.getByRole("heading", { name: "Oszacuj i znajdź błąd" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Obliczenie zawiera błąd" }));
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));

    expect(screen.getByRole("status")).toHaveTextContent("To obliczenie jest źle policzone.");
  });
});
