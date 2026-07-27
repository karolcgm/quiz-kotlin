/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { DecimalExpansionL6Lab } from "@/components/lessons/decimals/DecimalExpansionL6Lab";

afterEach(cleanup);

describe("DecimalExpansionL6Lab", () => {
  it("udostępnia pełne kratki dzielenia pisemnego przy rozwinięciu dziesiętnym", () => {
    const { container } = render(
      <DecimalExpansionL6Lab
        activity="decimal-long-division"
        seed={617300}
        questionNumber={1}
        questionCount={6}
      />,
    );

    expect(screen.getByRole("heading", { name: "Rozwinięcie dziesiętne przez dzielenie" })).toBeInTheDocument();
    expect(screen.getByText("Zadanie 1/6")).toBeInTheDocument();
    expect(screen.getByLabelText("Dzielenie pisemne 1 przez 3")).toBeInTheDocument();

    const answerCells = container.querySelectorAll<HTMLButtonElement>("[data-answer-cell]");
    expect(answerCells.length).toBeGreaterThan(10);
    expect(answerCells[0]).toHaveTextContent("");

    fireEvent.click(answerCells[0]!);
    fireEvent.click(screen.getByRole("button", { name: "0" }));
    expect(answerCells[0]).toHaveTextContent("0");

    expect(screen.getByLabelText("Zapis rozwinięcia dziesiętnego")).toHaveAttribute("readonly");
    expect(screen.getByLabelText("Zapis rozwinięcia dziesiętnego")).toHaveAttribute("inputmode", "none");
    expect(screen.getByRole("button", { name: "Zatwierdź" })).toBeInTheDocument();
  });
});
