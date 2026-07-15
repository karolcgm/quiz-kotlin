/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DecimalNotationL1Lab } from "@/components/lessons/decimals/DecimalNotationL1Lab";

afterEach(cleanup);

describe("DecimalNotationL1Lab", () => {
  it("synchronizuje 37 pól z 37/100 i 0,37 w czasie rzeczywistym", () => {
    const onResultChange = vi.fn();
    render(<DecimalNotationL1Lab activity="hundred-grid" seed={551002} onResultChange={onResultChange} />);

    fireEvent.change(screen.getByLabelText("Liczba zaznaczonych pól"), { target: { value: "37" } });
    expect(screen.getByText("37/100 = 0,37")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź zapis i model" }));
    expect(screen.getByRole("status")).toHaveTextContent("37 pól, ułamek 37/100 i zapis 0,37");
    expect(onResultChange).toHaveBeenLastCalledWith(true, "37/100 = 0,37");
  });

  it("obsługuje tabelę klawiaturą i diagnozuje brak zera wiodącego", () => {
    const { rerender } = render(<DecimalNotationL1Lab activity="place-table" seed={551003} />);
    fireEvent.change(screen.getByLabelText("jedności, cyfra"), { target: { value: "0" } });
    fireEvent.change(screen.getByLabelText("części dziesiąte, cyfra"), { target: { value: "3" } });
    fireEvent.change(screen.getByLabelText("części setne, cyfra"), { target: { value: "7" } });
    expect(screen.getByText(/37\/100 = 0,37 — trzydzieści siedem setnych/u)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź zapis i model" }));
    expect(screen.getByRole("status")).toHaveTextContent("Cyfra 3 oznacza trzy dziesiąte");

    rerender(<DecimalNotationL1Lab key="word" activity="word-digit" seed={551004} />);
    fireEvent.change(screen.getByLabelText("Zapis cyfrowy"), { target: { value: ",37" } });
    fireEvent.change(screen.getByLabelText("Zapis słowny liczby"), { target: { value: "trzydzieści siedem setnych" } });
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź zapis i model" }));
    expect(screen.getByText("Kody diagnostyczne: DEC_MISSING_ZERO")).toBeInTheDocument();
  });

  it("barwi 0,4 i 0,04 niezależnie od koloru oraz udostępnia dane tekstowe SVG", () => {
    render(<DecimalNotationL1Lab activity="glass" seed={551005} />);
    fireEvent.change(screen.getByLabelText("Zabarwienie szklanki A w setnych"), { target: { value: "40" } });
    fireEvent.change(screen.getByLabelText("Zabarwienie szklanki B w setnych"), { target: { value: "4" } });
    expect(screen.getByRole("img", { name: /Szklanka A — cztery dziesiąte.*40 ze 100/u })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /Szklanka B — cztery setne.*4 ze 100/u })).toBeInTheDocument();
    expect(screen.getAllByRole("columnheader", { name: "Zapis dziesiętny" })).toHaveLength(2);
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź zapis i model" }));
    expect(screen.getByRole("status")).toHaveTextContent("0,4 to 40 setnych, a 0,04 to 4 setne");
  });
});
