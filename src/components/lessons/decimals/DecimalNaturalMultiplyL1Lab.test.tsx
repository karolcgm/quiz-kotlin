/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DecimalNaturalMultiplyL1Lab } from "@/components/lessons/decimals/DecimalNaturalMultiplyL1Lab";

afterEach(cleanup);

describe("DecimalNaturalMultiplyL1Lab", () => {
  it("pokazuje ciągłą kreskę oraz puste kratki przeniesień i wyniku w mnożeniu pisemnym", () => {
    const { container } = render(<DecimalNaturalMultiplyL1Lab activity="decimal-natural-written" seed={557200} taskSeed={557200} />);
    expect(container.querySelector(".border-solid.border-slate-950")).toBeInTheDocument();
    expect(screen.queryByText("Przeniesienia")).not.toBeInTheDocument();
    const alignedRows = container.querySelectorAll("[data-written-column-grid]");
    expect(alignedRows).toHaveLength(4);
    expect(new Set([...alignedRows].map((row) => row.getAttribute("style"))).size).toBe(1);
    expect(screen.getByLabelText("Kratka 1 wyniku")).toHaveTextContent("");
    expect(screen.getByLabelText("Kratka 3 wyniku")).toHaveTextContent("");
    expect(screen.getByLabelText("Mała kratka 1 nad działaniem")).toHaveTextContent("");
  });

  it("wpisuje wynik do kratek i zatwierdza go klawiaturą", () => {
    const onResultChange = vi.fn();
    render(<DecimalNaturalMultiplyL1Lab activity="decimal-natural-written" seed={557200} taskSeed={557200} onResultChange={onResultChange} />);
    fireEvent.click(screen.getByRole("button", { name: "7" }));
    fireEvent.click(screen.getByRole("button", { name: "0" }));
    fireEvent.click(screen.getByRole("button", { name: "5" }));
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
    expect(onResultChange).toHaveBeenLastCalledWith(true, "7,05");
  });

  it("pokazuje pełne działanie pamięciowe i małą kratkę na wynik", () => {
    render(<DecimalNaturalMultiplyL1Lab activity="decimal-natural-mental" seed={557100} taskSeed={557100} questionNumber={1} questionCount={10} />);

    expect(screen.getByLabelText("Działanie 1,2 razy 3")).toHaveTextContent("1,2 · 3 =");
    expect(screen.getByLabelText("Wynik działania w pamięci")).toHaveClass("w-32");
    expect(screen.getByText(/1\s*\/\s*10/u)).toBeInTheDocument();
  });

  it("po błędzie pokazuje tylko krótki komunikat przy zadaniu", () => {
    render(<DecimalNaturalMultiplyL1Lab activity="decimal-natural-mental" seed={557100} taskSeed={557100} />);

    fireEvent.click(screen.getByRole("button", { name: "2" }));
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));

    expect(screen.getByText(/Spróbuj jeszcze raz/u)).toHaveTextContent("Spróbuj jeszcze raz");
    expect(screen.queryByText("Potrzebuję następnej wskazówki")).not.toBeInTheDocument();
  });

  it("prowadzi zadanie tekstowe przez grafikę, zapis pisemny i odpowiedź", () => {
    const onResultChange = vi.fn();
    render(<DecimalNaturalMultiplyL1Lab activity="decimal-natural-story" seed={557300} taskSeed={557300} onResultChange={onResultChange} />);

    expect(screen.getByText(/4 jednakowe butelki soku/u)).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /skrzynki z butelkami soku/u })).toBeInTheDocument();
    expect(screen.getByText("Samodzielnie zapisz działanie")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Pierwszy czynnik, cyfra 1" })).toHaveTextContent("");
    expect(screen.getByRole("button", { name: "Drugi czynnik, cyfra 1" })).toHaveTextContent("");

    fireEvent.click(screen.getByRole("button", { name: "1" }));
    fireEvent.click(screen.getByRole("button", { name: "2" }));
    fireEvent.click(screen.getByRole("button", { name: "5" }));
    fireEvent.click(screen.getByRole("button", { name: "Drugi czynnik, cyfra 1" }));
    fireEvent.click(screen.getByRole("button", { name: "4" }));
    fireEvent.click(screen.getByRole("button", { name: "Kratka 1 wyniku" }));
    fireEvent.click(screen.getByRole("button", { name: "5" }));
    fireEvent.click(screen.getByRole("button", { name: "0" }));
    fireEvent.click(screen.getByRole("button", { name: "0" }));
    fireEvent.click(screen.getByRole("button", { name: "Odpowiedź do zadania tekstowego" }));
    fireEvent.click(screen.getByRole("button", { name: "5" }));
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));

    expect(onResultChange).toHaveBeenLastCalledWith(true, "5 l");
  });

  it("zostawia pełny komplet kratek także wtedy, gdy iloczyn kończy się zerami", () => {
    render(<DecimalNaturalMultiplyL1Lab activity="decimal-natural-story" seed={557302} taskSeed={557302} />);

    expect(screen.getByRole("img", { name: /biletów na szkolne przedstawienie/u })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Kratka 1 wyniku" })).toHaveTextContent("");
    expect(screen.getByRole("button", { name: "Kratka 4 wyniku" })).toHaveTextContent("");
    expect(screen.queryByRole("button", { name: "Kratka 5 wyniku" })).not.toBeInTheDocument();
  });
});
