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

  it("pozwala rozpoznać gotowe rozwinięcie i wpisać jego najkrótszy okres", () => {
    render(
      <DecimalExpansionL6Lab
        activity="decimal-period"
        seed={617400}
        questionNumber={1}
        questionCount={6}
      />,
    );

    expect(screen.getByText("0,272727…")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "okresowe" }));
    fireEvent.click(screen.getByRole("button", { name: "2" }));
    fireEvent.click(screen.getByRole("button", { name: "7" }));

    expect(screen.getByLabelText("Okres rozwinięcia")).toHaveValue("27");
    expect(screen.getByLabelText("Okres rozwinięcia")).toHaveAttribute("readonly");
    expect(screen.getByLabelText("Okres rozwinięcia")).toHaveAttribute("inputmode", "none");

    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByRole("status")).toHaveTextContent("Poprawnie");
  });

  it("umożliwia wskazanie rozwinięcia skończonego bez okresu", () => {
    render(
      <DecimalExpansionL6Lab
        activity="decimal-period"
        seed={617401}
        questionNumber={2}
        questionCount={6}
      />,
    );

    expect(screen.getByText("0,125")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "brak okresu" }));
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));

    expect(screen.getByRole("status")).toHaveTextContent("Poprawnie");
  });
});
