/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { DecimalWrittenStoryLab } from "@/components/lessons/decimals/DecimalWrittenStoryLab";

afterEach(cleanup);

describe("DecimalWrittenStoryLab", () => {
  it("zachowuje pozycję cyfry wpisanej najpierw w ostatniej kratce wyniku", () => {
    render(<DecimalWrittenStoryLab activity="decimal-written-story" seed={558300} />);
    fireEvent.click(screen.getByRole("button", { name: "+" }));
    const lastResultCell = screen.getByRole("button", { name: "Wynik działania, cyfra 4" });
    fireEvent.click(lastResultCell);
    fireEvent.click(screen.getByRole("button", { name: "3" }));
    expect(lastResultCell).toHaveTextContent("3");
    expect(screen.getByRole("button", { name: "Wynik działania, cyfra 1" })).not.toHaveTextContent("3");
  });
});
