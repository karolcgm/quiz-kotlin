/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DecimalNotationL1Lab } from "@/components/lessons/decimals/DecimalNotationL1Lab";

afterEach(cleanup);

describe("DecimalNotationL2Lab przez lokalny adapter L1", () => {
  it("obsługuje tabelę do tysięcznych dotykiem i klawiaturą", () => {
    render(<DecimalNotationL1Lab activity="thousandths-table" seed={552001} />);
    fireEvent.change(screen.getByLabelText("jedności, cyfra"), { target: { value: "0" } });
    fireEvent.change(screen.getByLabelText("części dziesiąte, cyfra"), { target: { value: "3" } });
    fireEvent.change(screen.getByLabelText("części setne, cyfra"), { target: { value: "7" } });
    fireEvent.change(screen.getByLabelText("części tysięczne, cyfra"), { target: { value: "5" } });
    fireEvent.keyDown(screen.getByLabelText("części setne, cyfra"), { key: "ArrowRight" });
    expect(screen.getByLabelText("części tysięczne, cyfra")).toHaveFocus();
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź pozycje i zapis" }));
    expect(screen.getByRole("status")).toHaveTextContent("częściach dziesiątych, setnych i tysięcznych");
  });

  it("powiększa oś dziesiąte → setne → tysięczne i zachowuje dane tekstowe", () => {
    render(<DecimalNotationL1Lab activity="zoom-axis" seed={552002} />);
    fireEvent.click(screen.getByRole("button", { name: "Powiększ" }));
    fireEvent.click(screen.getByRole("button", { name: "Powiększ" }));
    for (let index = 0; index < 5; index += 1) fireEvent.click(screen.getByRole("button", { name: "Następna kreska" }));

    expect(screen.getByRole("img", { name: /Oś liczbowa — tysięczne.*0,375/u })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Wartość" })).toBeInTheDocument();
    expect(screen.getByLabelText("Punkt osi — tysięczne")).toHaveAttribute("aria-valuetext", "0,375");
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź pozycje i zapis" }));
    expect(screen.getByRole("status")).toHaveTextContent("piąta tysięczna od 0,370");
  });

  it("zamienia reprezentacje w obie strony i diagnozuje brak zera osobno od złej pozycji", () => {
    const { rerender } = render(<DecimalNotationL1Lab activity="representation-bridge" seed={552003} />);
    fireEvent.change(screen.getByLabelText("Zapis dziesiętny"), { target: { value: ",375" } });
    fireEvent.change(screen.getByLabelText("Licznik ułamka"), { target: { value: "375" } });
    fireEvent.change(screen.getByLabelText("Mianownik ułamka"), { target: { value: "1000" } });
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź pozycje i zapis" }));
    expect(screen.getByText("Kody diagnostyczne: DEC_MISSING_ZERO")).toBeInTheDocument();

    rerender(<DecimalNotationL1Lab key="wrong-place" activity="representation-bridge" seed={552003} />);
    fireEvent.change(screen.getByLabelText("Zapis dziesiętny"), { target: { value: "0,0375" } });
    fireEvent.change(screen.getByLabelText("Licznik ułamka"), { target: { value: "375" } });
    fireEvent.change(screen.getByLabelText("Mianownik ułamka"), { target: { value: "1000" } });
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź pozycje i zapis" }));
    expect(screen.getByText("Kody diagnostyczne: DEC_PLACE_VALUE")).toBeInTheDocument();
  });

  it("odmierza 0,4 l, 0,04 l i 0,004 l z lekką wodą oraz alternatywą tekstową", () => {
    const { container } = render(<DecimalNotationL1Lab activity="dye-lab-l2" seed={552004} />);
    fireEvent.change(screen.getByLabelText("Liczba tysięcznych w naczyniu A"), { target: { value: "400" } });
    fireEvent.change(screen.getByLabelText("Liczba tysięcznych w naczyniu B"), { target: { value: "40" } });
    fireEvent.change(screen.getByLabelText("Liczba tysięcznych w naczyniu C"), { target: { value: "4" } });

    expect(screen.getByRole("img", { name: /Naczynie A — 0,4 litra.*400 z 1000/u })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /Naczynie B — 0,04 litra.*40 z 1000/u })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /Naczynie C — 0,004 litra.*4 z 1000/u })).toBeInTheDocument();
    expect(screen.getAllByRole("columnheader", { name: "Litry" })).toHaveLength(3);
    expect(container.querySelectorAll("[data-water-thousandths]")).toHaveLength(3);
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź pozycje i zapis" }));
    expect(screen.getByRole("status")).toHaveTextContent("dziesięć razy mniejszą");
  });

  it("ocenia wariant challenge bez ujawniania answerSpec", () => {
    const onResultChange = vi.fn();
    const { container } = render(<DecimalNotationL1Lab activity="independent-l2" seed={552005} taskSeed={502105} difficulty="challenge" onResultChange={onResultChange} />);
    fireEvent.change(screen.getByLabelText("jedności, cyfra"), { target: { value: "0" } });
    fireEvent.change(screen.getByLabelText("części dziesiąte, cyfra"), { target: { value: "0" } });
    fireEvent.change(screen.getByLabelText("części setne, cyfra"), { target: { value: "0" } });
    fireEvent.change(screen.getByLabelText("części tysięczne, cyfra"), { target: { value: "4" } });
    fireEvent.change(screen.getByLabelText("Zapis dziesiętny"), { target: { value: "0,004" } });
    fireEvent.change(screen.getByLabelText("Licznik ułamka"), { target: { value: "4" } });
    fireEvent.change(screen.getByLabelText("Mianownik ułamka"), { target: { value: "1000" } });
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź pozycje i zapis" }));

    expect(onResultChange).toHaveBeenLastCalledWith(true, "4/1000 = 0,004");
    expect(container.querySelector("[data-answer-spec='server-only']")).toBeInTheDocument();
    expect(container.textContent).not.toContain("answerSpec");
  });
});
