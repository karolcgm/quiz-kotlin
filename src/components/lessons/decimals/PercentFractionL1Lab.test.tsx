/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DecimalNotationL1Lab } from "@/components/lessons/decimals/DecimalNotationL1Lab";

afterEach(cleanup);

describe("Procenty a ułamki przez lokalny adapter decimal-notation-l1", () => {
  it("pokazuje pięć podstawowych równoważności procentów", () => {
    const { container } = render(<DecimalNotationL1Lab activity="percent-remember" seed={563100} />);

    expect(screen.getByText("10%")).toBeInTheDocument();
    expect(screen.getByText("20%")).toBeInTheDocument();
    expect(screen.getByText("25%")).toBeInTheDocument();
    expect(screen.getByText("50%")).toBeInTheDocument();
    expect(screen.getByText("100%")).toBeInTheDocument();
    expect(screen.getAllByLabelText("1 przez 5")).toHaveLength(1);
    expect(container.querySelectorAll("[data-percent-remember-row]")).toHaveLength(2);
    expect(container.querySelectorAll("[data-percent-remember-row]:first-child > div")).toHaveLength(3);
    expect(container.querySelectorAll("[data-percent-remember-row]:last-child > div")).toHaveLength(2);
  });

  it("zalicza zaznaczenie 10 pól na kratownicy 10×10", () => {
    const onResultChange = vi.fn();
    render(<DecimalNotationL1Lab activity="percent-grid" seed={563200} onResultChange={onResultChange} />);

    for (let index = 1; index <= 10; index += 1) {
      fireEvent.click(screen.getByRole("button", { name: `Pole ${index}` }));
    }
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));

    expect(screen.getByRole("status")).toHaveTextContent("Dobrze");
    expect(onResultChange).toHaveBeenLastCalledWith(true, "10%");
  });

  it("rozpoznaje, że co piąty to 20%", () => {
    const onResultChange = vi.fn();
    render(<DecimalNotationL1Lab activity="percent-story" seed={563300} onResultChange={onResultChange} />);

    fireEvent.click(screen.getByRole("button", { name: "2" }));
    fireEvent.click(screen.getByRole("button", { name: "0" }));
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));

    expect(screen.getByRole("status")).toHaveTextContent("Dobrze");
    expect(onResultChange).toHaveBeenLastCalledWith(true, "20%");
  });
});
