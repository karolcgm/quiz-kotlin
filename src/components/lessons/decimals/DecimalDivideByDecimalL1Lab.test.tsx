/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DecimalDivideByDecimalL1Lab } from "@/components/lessons/decimals/DecimalDivideByDecimalL1Lab";

afterEach(cleanup);

describe("DecimalDivideByDecimalL1Lab", () => {
  it("przesuwa oba przecinki po jednym kliknięciu i dopiero potem sprawdza iloraz", () => {
    const onResultChange = vi.fn();
    render(<DecimalDivideByDecimalL1Lab activity="decimal-divide-by-decimal-shift" seed={560100} onResultChange={onResultChange} />);
    expect(screen.getAllByText("6 : 0,2").length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole("button", { name: "Przesuń oba przecinki o jedno miejsce w prawo" }));
    expect(screen.getAllByText("60 : 2").length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole("button", { name: "3" }));
    fireEvent.click(screen.getByRole("button", { name: "0" }));
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
    expect(onResultChange).toHaveBeenLastCalledWith(true, "30");
  });
});
