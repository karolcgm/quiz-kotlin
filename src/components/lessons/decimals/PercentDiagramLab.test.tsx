/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PercentDiagramLab } from "@/components/lessons/decimals/PercentDiagramLab";

afterEach(cleanup);

describe("PercentDiagramLab", () => {
  it("pokazuje jeden diagram, legendę i trzy puste pola odpowiedzi", () => {
    const { container } = render(
      <PercentDiagramLab
        activity="percent-diagrams-pie"
        seed={664100}
        questionNumber={1}
        questionCount={4}
      />,
    );

    expect(container.querySelectorAll("[data-lesson-task-frame]")).toHaveLength(1);
    expect(screen.getByText("Zadanie 1/4")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /Diagram kołowy/ })).toBeInTheDocument();
    expect(screen.getByRole("complementary", { name: "Legenda diagramu" })).toBeInTheDocument();

    const inputs = screen.getAllByRole("textbox");
    expect(inputs).toHaveLength(3);
    for (const input of inputs) {
      expect(input).toHaveAttribute("inputmode", "none");
      expect(input).toHaveAttribute("readonly");
      expect(input).toHaveValue("");
    }
  });

  it("wymaga wszystkich odpowiedzi i zalicza komplet danych z diagramu", () => {
    const onResultChange = vi.fn();
    render(
      <PercentDiagramLab
        activity="percent-diagrams-pie"
        seed={664100}
        onResultChange={onResultChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Uzupełnij wszystkie odpowiedzi");

    const enter = (question: number, digits: string) => {
      fireEvent.click(screen.getByRole("textbox", { name: `Odpowiedź na pytanie ${question}` }));
      for (const digit of digits) fireEvent.click(screen.getByRole("button", { name: digit }));
    };

    enter(1, "25");
    enter(2, "60");
    enter(3, "25");
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));

    expect(screen.getByRole("status")).toHaveTextContent("Dobrze");
    expect(onResultChange).toHaveBeenLastCalledWith(true, "25%, 60%, 25%");
  });

  it("pokazuje podwójne słupki i obie pozycje legendy", () => {
    render(<PercentDiagramLab activity="percent-diagrams-bars" seed={664201} readOnly />);

    expect(screen.getByRole("img", { name: /Diagram słupkowy/ })).toBeInTheDocument();
    expect(screen.getByText("klasa 6A")).toBeInTheDocument();
    expect(screen.getByText("klasa 6B")).toBeInTheDocument();
  });
});
