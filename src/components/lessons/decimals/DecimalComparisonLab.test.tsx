/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DecimalNotationL1Lab } from "@/components/lessons/decimals/DecimalNotationL1Lab";

afterEach(cleanup);

describe("DecimalComparisonLab przez lokalny adapter decimal-notation-l1", () => {
  it("wyrównuje 0,5 i 0,50 zerem pomocniczym oraz akceptuje znak równości", () => {
    const onResultChange = vi.fn();
    const { container, rerender } = render(<DecimalNotationL1Lab activity="align-places" seed={552101} onResultChange={onResultChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Dodaj zero pomocnicze do 0,5" }));
    expect(screen.getByText(/0,5 → 0,50/u)).toBeInTheDocument();
    expect(container.querySelector("[data-auxiliary-zero='true']")).toHaveTextContent("0 pomocnicze");
    fireEvent.click(screen.getByRole("button", { name: "0,5 i 0,50: znak równości" }));
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź porównanie" }));
    expect(screen.getByRole("status")).toHaveTextContent("0,5 i 0,50 nadal oznaczają ten sam punkt");
    expect(onResultChange).toHaveBeenLastCalledWith(true, "0,5 = 0,50");

    rerender(<DecimalNotationL1Lab key="wrong" activity="align-places" seed={552101} />);
    fireEvent.click(screen.getByRole("button", { name: "Dodaj zero pomocnicze do 0,5" }));
    fireEvent.click(screen.getByRole("button", { name: "0,5 i 0,50: znak mniejszości" }));
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź porównanie" }));
    expect(screen.getByText("Kody diagnostyczne: DEC_TRAILING_ZERO_VALUE")).toBeInTheDocument();
  });

  it("odsłania kolumny od lewej i oznacza pierwszą różną parę", () => {
    const { container } = render(<DecimalNotationL1Lab activity="compare-left" seed={552107} difficulty="core" />);
    const reveal = screen.getByRole("button", { name: "Odsłoń następną kolumnę" });
    fireEvent.click(reveal);
    fireEvent.click(reveal);
    fireEvent.click(reveal);
    expect(container.querySelectorAll("[data-first-difference='true']")).toHaveLength(2);
    expect(container.querySelector("[data-comparison-column='hundredths'][data-first-difference='true']")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "2,376 i 2,369: znak większości" }));
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź porównanie" }));
    expect(screen.getByRole("status")).toHaveTextContent("części setne");
  });

  it("powiększa wspólną oś do tysięcznych i wymaga poprawnej kolejności", () => {
    const { container } = render(<DecimalNotationL1Lab activity="shared-axis" seed={552103} />);
    fireEvent.click(screen.getByRole("button", { name: "Powiększ oś" }));
    fireEvent.click(screen.getByRole("button", { name: "Powiększ oś" }));
    expect(screen.getByRole("button", { name: "Powiększenie tysięcznych" })).toHaveAttribute("aria-pressed", "true");
    expect(container.querySelectorAll("[data-decimal-point]")).toHaveLength(3);
    expect(screen.getByRole("columnheader", { name: "Położenie" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "1,18 < 1,2 < 1,205" }));
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź porównanie" }));
    expect(screen.getByRole("status")).toHaveTextContent("1,18 < 1,2 < 1,205");
  });

  it("rozwiązuje obie pułapki liczby cyfr", () => {
    render(<DecimalNotationL1Lab activity="digit-traps" seed={552104} />);
    fireEvent.click(screen.getByRole("button", { name: "0,9 i 0,899: znak większości" }));
    fireEvent.click(screen.getByRole("button", { name: "3,04 i 3,4: znak mniejszości" }));
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź porównanie" }));
    expect(screen.getByRole("status")).toHaveTextContent("0,9 > 0,899, a 3,04 < 3,4");
  });

  it("układa ranking robotów przyciskami i wymaga uzasadnienia", () => {
    const onResultChange = vi.fn();
    const { container } = render(<DecimalNotationL1Lab activity="robot-ranking" seed={552105} taskSeed={552107} difficulty="core" onResultChange={onResultChange} />);
    const turboHigher = () => screen.getByRole("button", { name: "Przesuń robota Turbo wyżej" });
    expect(turboHigher().tagName).toBe("BUTTON");
    fireEvent.click(turboHigher());
    fireEvent.click(turboHigher());
    expect(Array.from(container.querySelectorAll("[data-robot-id]")).map((element) => element.getAttribute("data-robot-id"))).toEqual(["turbo", "neon", "pixel"]);
    expect(screen.getByText(/Aktualny ranking: Turbo 1,205 m → Neon 1,2 m → Piksel 1,18 m/u)).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("części tysięczne"));
    fireEvent.change(screen.getByLabelText("Uzasadnienie rankingu robotów"), { target: { value: "Porównuję od lewej; rozstrzyga cyfra tysięcznych." } });
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź porównanie" }));
    expect(screen.getByRole("status")).toHaveTextContent("Ranking jest malejący");
    expect(onResultChange).toHaveBeenLastCalledWith(true, "turbo → neon → pixel");
    expect(container.querySelector("[data-answer-spec='server-only']")).toBeInTheDocument();
    expect(container.textContent).not.toContain("answerSpec");
  });
});
