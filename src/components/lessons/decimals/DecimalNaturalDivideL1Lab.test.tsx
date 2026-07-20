/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DecimalNaturalDivideL1Lab } from "@/components/lessons/decimals/DecimalNaturalDivideL1Lab";

afterEach(cleanup);

describe("DecimalNaturalDivideL1Lab", () => {
  it("pokazuje zasadę przecinka i dopisywanie zera w dzieleniu pisemnym", () => {
    render(<DecimalNaturalDivideL1Lab activity="decimal-natural-divide-written" seed={559200} />);
    expect(screen.getByText(/Przecinek w ilorazie zapisujemy dokładnie nad przecinkiem/u)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Dopisz 0" })).toBeInTheDocument();
  });

  it("wymaga dopisania zer i kompletnego ilorazu", () => {
    const onResultChange = vi.fn();
    render(<DecimalNaturalDivideL1Lab activity="decimal-natural-divide-written" seed={559200} onResultChange={onResultChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Dopisz 0" }));
    fireEvent.click(screen.getByRole("button", { name: "Dopisz 0" }));
    for (const digit of ["0", "5", "2", "5"]) fireEvent.click(screen.getByRole("button", { name: digit }));
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
    expect(onResultChange).toHaveBeenLastCalledWith(true, "0,525");
  });
});
