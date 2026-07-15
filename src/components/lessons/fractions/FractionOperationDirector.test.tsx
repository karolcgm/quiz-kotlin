/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { FractionOperationDirector } from "@/components/lessons/fractions/FractionOperationDirector";
import type { FractionOperationStep } from "@/components/lessons/fractions/FractionOperationDirector";

afterEach(() => cleanup());

const steps: FractionOperationStep[] = [
  {
    id: "same-denominator",
    label: "Sprawdź wielkość części",
    explanation: "Oba mianowniki opisują części tej samej wielkości.",
    highlights: [{
      id: "denominators",
      kind: "pair",
      memberIds: ["left-denominator", "right-denominator"],
      label: "części tej samej wielkości",
      state: "active",
      pattern: "double",
      symbol: "◆",
      accent: "cyan",
    }],
    connectors: [{
      id: "denominator-link",
      fromId: "left-denominator",
      toId: "right-denominator",
      label: "części tej samej wielkości",
      symbol: "◆",
      pattern: "double",
      accent: "cyan",
    }],
  },
  {
    id: "cancel",
    label: "Skróć aktywną parę",
    explanation: "Stara liczba pozostaje przekreślona, a nowa jest obok.",
    crossOuts: [{ memberId: "left-numerator", oldValue: 6, newValue: 3, label: "Podzielono przez 2" }],
    feedbackCode: "FRA_WRONG_OPERATION_PAIR",
    feedbackMemberIds: ["left-numerator", "right-denominator"],
  },
];

describe("FractionOperationDirector", () => {
  it("pokazuje właściwe pary symbolem, wzorem linii i łącznikiem", () => {
    const { container } = render(
      <FractionOperationDirector
        items={[
          { id: "left", label: "pierwszy ułamek", numerator: 6, denominator: 8 },
          { id: "right", label: "drugi ułamek", numerator: 2, denominator: 8 },
        ]}
        operator="+"
        steps={steps}
      />,
    );
    expect(container.querySelector('[data-operation-member="left-denominator"]')).toHaveAttribute("data-highlight-symbol", "◆");
    expect(container.querySelector('[data-connector-from="left-denominator"]')).toHaveAttribute("data-connector-to", "right-denominator");
    expect(screen.getByText("części tej samej wielkości")).toBeInTheDocument();
  });

  it("zmienia krok z widocznym focusem, pokazuje skreślenie i resetuje", () => {
    const { container } = render(
      <FractionOperationDirector
        items={[
          { id: "left", label: "pierwszy ułamek", numerator: 6, denominator: 8 },
          { id: "right", label: "drugi ułamek", numerator: 2, denominator: 8 },
        ]}
        operator="×"
        steps={steps}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Następny krok →" }));
    expect(screen.getByRole("heading", { name: "Skróć aktywną parę" })).toHaveFocus();
    expect(container.querySelector('[data-operation-member="left-numerator"]')).toHaveTextContent("6→3");
    expect(screen.getByText("Połączono kratki, które nie tworzą aktywnej pary tego kroku.")).toBeInTheDocument();
    expect(screen.getByText("Kody diagnostyczne: FRA_WRONG_OPERATION_PAIR")).toHaveClass("sr-only");

    fireEvent.click(screen.getByRole("button", { name: "Resetuj" }));
    expect(screen.getByRole("heading", { name: "Sprawdź wielkość części" })).toHaveFocus();
  });
});
