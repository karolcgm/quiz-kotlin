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

  it("łączy dzielenie z nazwaniem rozwinięcia i wpisaniem najkrótszego okresu", () => {
    render(
      <DecimalExpansionL6Lab
        activity="decimal-long-division"
        seed={617300}
        questionNumber={1}
        questionCount={6}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "okresowe" }));
    fireEvent.click(screen.getByLabelText("Okres rozwinięcia"));
    fireEvent.click(screen.getByRole("button", { name: "2" }));

    expect(screen.getByLabelText("Okres rozwinięcia")).toHaveValue("2");
    expect(screen.getByLabelText("Okres rozwinięcia")).toHaveAttribute("readonly");
    expect(screen.getByLabelText("Okres rozwinięcia")).toHaveAttribute("inputmode", "none");
  });

  it("w tym samym slajdzie umożliwia wskazanie rozwinięcia skończonego bez okresu", () => {
    render(
      <DecimalExpansionL6Lab
        activity="decimal-long-division"
        seed={617301}
        questionNumber={2}
        questionCount={6}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "brak okresu" }));

    expect(screen.getByRole("button", { name: "skończone" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByLabelText("Okres rozwinięcia")).toHaveValue("brak");
  });
});
