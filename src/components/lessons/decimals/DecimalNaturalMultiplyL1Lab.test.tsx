/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DecimalNaturalMultiplyL1Lab } from "@/components/lessons/decimals/DecimalNaturalMultiplyL1Lab";

afterEach(cleanup);

describe("DecimalNaturalMultiplyL1Lab", () => {
  it("pokazuje ciągłą kreskę i puste kratki wyniku w mnożeniu pisemnym", () => {
    const { container } = render(<DecimalNaturalMultiplyL1Lab activity="decimal-natural-written" seed={557200} taskSeed={557200} />);
    expect(container.querySelector(".border-solid.border-slate-950")).toBeInTheDocument();
    expect(screen.getByLabelText("Kratka 1 wyniku")).toHaveTextContent("");
    expect(screen.getByLabelText("Kratka 3 wyniku")).toHaveTextContent("");
  });

  it("wpisuje wynik do kratek i zatwierdza go klawiaturą", () => {
    const onResultChange = vi.fn();
    render(<DecimalNaturalMultiplyL1Lab activity="decimal-natural-written" seed={557200} taskSeed={557200} onResultChange={onResultChange} />);
    fireEvent.click(screen.getByRole("button", { name: "7" }));
    fireEvent.click(screen.getByRole("button", { name: "0" }));
    fireEvent.click(screen.getByRole("button", { name: "5" }));
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
    expect(onResultChange).toHaveBeenLastCalledWith(true, "7,05");
  });
});
