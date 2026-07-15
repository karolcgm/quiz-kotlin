/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DecimalNotationL1Lab } from "@/components/lessons/decimals/DecimalNotationL1Lab";

afterEach(cleanup);

describe("DecimalMeasurementL1Lab przez lokalny adapter decimal-notation-l1", () => {
  it("aktualizuje miarkę realtime w mm, cm i m oraz udostępnia dane tekstowe", () => {
    render(<DecimalNotationL1Lab activity="realtime-ruler" seed={553101} difficulty="core" />);
    fireEvent.change(screen.getByLabelText("Wpisz długość w milimetrach"), { target: { value: "2350" } });
    expect(screen.getAllByText("235 cm").length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText("2,35 m").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByRole("img", { name: /Miarka długości.*2350 mm.*235 cm.*2,35 m/u })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Milimetry" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź wartość i jednostkę" }));
    expect(screen.getByRole("status")).toHaveTextContent("2350 mm = 235 cm = 2,35 m");
  });

  it("składa 2 m i 35 cm, normalizuje kropkę oraz rozpoznaje pomyloną jednostkę", () => {
    const { rerender } = render(<DecimalNotationL1Lab activity="two-part-length" seed={553102} />);
    fireEvent.click(screen.getByRole("button", { name: "÷100" }));
    fireEvent.change(screen.getByLabelText("Wynik liczbowy"), { target: { value: "2.35" } });
    expect(screen.getByLabelText("Wynik liczbowy")).toHaveValue("2,35");
    fireEvent.change(screen.getByLabelText("Jednostka wyniku"), { target: { value: "m" } });
    expect(
      screen.getByText((_, element) => element?.textContent === "Aktualny zapis: 2,35"),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź wartość i jednostkę" }));
    expect(screen.getByRole("status")).toHaveTextContent("2 m + 35 cm = 2,35 m");

    rerender(<DecimalNotationL1Lab key="wrong-unit" activity="two-part-length" seed={553102} />);
    fireEvent.click(screen.getByRole("button", { name: "÷100" }));
    fireEvent.change(screen.getByLabelText("Wynik liczbowy"), { target: { value: "2,35" } });
    fireEvent.change(screen.getByLabelText("Jednostka wyniku"), { target: { value: "cm" } });
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź wartość i jednostkę" }));
    expect(screen.getByText("Kody diagnostyczne: DEC_UNIT_MISMATCH")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("wymaga jawnej jednostki m");
  });

  it("wymaga mnożnika ×100 i diagnozuje jego zły wybór osobno od przecinka", () => {
    const { rerender } = render(<DecimalNotationL1Lab activity="unit-scale-length" seed={553103} difficulty="core" />);
    fireEvent.click(screen.getByRole("button", { name: "×100" }));
    fireEvent.change(screen.getByLabelText("Wynik liczbowy"), { target: { value: "405" } });
    fireEvent.change(screen.getByLabelText("Jednostka wyniku"), { target: { value: "cm" } });
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź wartość i jednostkę" }));
    expect(screen.getByRole("status")).toHaveTextContent("4,05 m = 405 cm");

    rerender(<DecimalNotationL1Lab key="wrong-factor" activity="unit-scale-length" seed={553103} difficulty="core" />);
    fireEvent.click(screen.getByRole("button", { name: "×10" }));
    fireEvent.change(screen.getByLabelText("Wynik liczbowy"), { target: { value: "40,5" } });
    fireEvent.change(screen.getByLabelText("Jednostka wyniku"), { target: { value: "cm" } });
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź wartość i jednostkę" }));
    expect(screen.getByText("Kody diagnostyczne: DEC_ESTIMATE_RANGE")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Wybrany mnożnik nie pasuje");

    rerender(<DecimalNotationL1Lab key="wrong-comma" activity="unit-scale-length" seed={553103} difficulty="core" />);
    fireEvent.click(screen.getByRole("button", { name: "×100" }));
    fireEvent.change(screen.getByLabelText("Wynik liczbowy"), { target: { value: "40,5" } });
    fireEvent.change(screen.getByLabelText("Jednostka wyniku"), { target: { value: "cm" } });
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź wartość i jednostkę" }));
    expect(screen.getByText("Kody diagnostyczne: DEC_PLACE_VALUE")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Sprawdź pozycję przecinka");
  });

  it("rozwiązuje realistyczną historię trasy z jawną jednostką", () => {
    render(<DecimalNotationL1Lab activity="length-story" seed={553104} difficulty="core" />);
    expect(screen.getByText(/Trasa robota pomiarowego ma 1 km 250 m/u)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "÷1000" }));
    fireEvent.change(screen.getByLabelText("Wynik liczbowy"), { target: { value: "1,25" } });
    fireEvent.change(screen.getByLabelText("Jednostka wyniku"), { target: { value: "km" } });
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź wartość i jednostkę" }));
    expect(screen.getByRole("status")).toHaveTextContent("1 km + 250 m = 1,25 km");
  });

  it("ocenia deterministyczny wariant challenge bez ujawniania answerSpec", () => {
    const onResultChange = vi.fn();
    const { container } = render(<DecimalNotationL1Lab activity="independent-length" seed={553105} taskSeed={553105} difficulty="challenge" onResultChange={onResultChange} />);
    fireEvent.click(screen.getByRole("button", { name: "×1000" }));
    fireEvent.change(screen.getByLabelText("Wynik liczbowy"), { target: { value: "1275" } });
    fireEvent.change(screen.getByLabelText("Jednostka wyniku"), { target: { value: "m" } });
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź wartość i jednostkę" }));
    expect(onResultChange).toHaveBeenLastCalledWith(true, "1275 m");
    expect(container.querySelector("[data-answer-spec='server-only']")).toBeInTheDocument();
    expect(container.textContent).not.toContain("answerSpec");
  });
});
