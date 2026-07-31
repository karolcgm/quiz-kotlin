/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DecimalNotationL1Lab } from "@/components/lessons/decimals/DecimalNotationL1Lab";

afterEach(cleanup);

describe("metoda ul ulamka w temacie Jaki to procent", () => {
  it("pokazuje przyklad z kapeluszami i kolejne etapy", () => {
    const { container } = render(
      <DecimalNotationL1Lab activity="percent-six-what-fraction-example" seed={662300} readOnly />,
    );

    expect(screen.getByText(/Pani Barbara ma 28 kapeluszy/)).toBeInTheDocument();
    expect(screen.getByText("1. Część całości")).toBeInTheDocument();
    expect(screen.getByText("2. Po skróceniu")).toBeInTheDocument();
    expect(screen.getByText("3. Procent")).toBeInTheDocument();
    expect(screen.getAllByText("75%").length).toBeGreaterThan(0);
    expect(container.textContent).not.toContain("21/28");
    expect(container.textContent).not.toContain("3/4");
  });

  it("wymaga calego zapisu i zatwierdza poprawne rozwiazanie", () => {
    const onResultChange = vi.fn();
    render(
      <DecimalNotationL1Lab
        activity="percent-six-what-fraction-practice"
        seed={662300}
        readOnly={false}
        onResultChange={onResultChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByRole("status")).toHaveTextContent("Uzupełnij obydwa ułamki");

    const enter = (label: string, digits: string) => {
      fireEvent.click(screen.getByRole("button", { name: label }));
      for (const digit of digits) {
        fireEvent.click(screen.getByRole("button", { name: digit }));
      }
    };

    enter("Ułamek opisujący część całości — licznik", "21");
    enter("Ułamek opisujący część całości — mianownik", "28");
    enter("Ułamek po skróceniu — licznik", "3");
    enter("Ułamek po skróceniu — mianownik", "4");
    enter("Wynik w procentach", "75");
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));

    expect(screen.getByRole("status")).toHaveTextContent("Dobrze");
    expect(onResultChange).toHaveBeenLastCalledWith(
      true,
      "część 21 z 28, po skróceniu 3 z 4, 75%",
    );
  });

  it("zalicza poprawny procent mimo innego zapisu pomocniczego", () => {
    const onResultChange = vi.fn();
    render(
      <DecimalNotationL1Lab
        activity="percent-six-what-fraction-practice"
        seed={662300}
        readOnly={false}
        onResultChange={onResultChange}
      />,
    );

    const enter = (label: string, digits: string) => {
      fireEvent.click(screen.getByRole("button", { name: label }));
      for (const digit of digits) fireEvent.click(screen.getByRole("button", { name: digit }));
    };

    enter("Ułamek opisujący część całości — licznik", "20");
    enter("Ułamek opisujący część całości — mianownik", "27");
    enter("Ułamek po skróceniu — licznik", "5");
    enter("Ułamek po skróceniu — mianownik", "7");
    enter("Wynik w procentach", "75");
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));

    expect(screen.getByRole("status")).toHaveTextContent("Dobrze");
    expect(onResultChange).toHaveBeenLastCalledWith(
      true,
      "część 21 z 28, po skróceniu 3 z 4, 75%",
    );
  });
});
