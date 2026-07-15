/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DecimalNotationL1Lab } from "@/components/lessons/decimals/DecimalNotationL1Lab";

afterEach(cleanup);

function answerTask(index: number, operation: string, value: string, unit: string) {
  fireEvent.click(screen.getByRole("button", { name: `${operation} dla zadania ${index}` }));
  fireEvent.change(screen.getByLabelText(`Wynik liczbowy zadania ${index}`), { target: { value } });
  fireEvent.change(screen.getByLabelText(`Jednostka wyniku zadania ${index}`), { target: { value: unit } });
}

describe("DecimalMeasurementL2Lab przez lokalny adapter decimal-notation-l1", () => {
  it("aktualizuje wagę kg/dag/g realtime i udostępnia dokładną tabelę tekstową", () => {
    render(<DecimalNotationL1Lab activity="laboratory-scale-mass" seed={553201} difficulty="core" />);
    fireEvent.change(screen.getByLabelText("Liczba odważników kg"), { target: { value: "1" } });
    fireEvent.change(screen.getByLabelText("Liczba odważników dag"), { target: { value: "24" } });
    fireEvent.change(screen.getByLabelText("Liczba odważników g"), { target: { value: "5" } });
    expect(screen.getAllByText("1245 g").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("124,5 dag").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("1,245 kg").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole("img", { name: /Waga laboratoryjna.*1 kg, 24 dag i 5 g.*1245 g.*1,245 kg/u })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Odważniki kg" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź mnożnik, wartość, jednostkę i realizm" }));
    expect(screen.getByRole("status")).toHaveTextContent("1245 g = 124,5 dag = 1,245 kg");
  });

  it("wyjaśnia zmianę kg na dag mnożnikiem ×100 i diagnozuje zły przecinek", () => {
    const { rerender } = render(<DecimalNotationL1Lab activity="unit-scale-mass" seed={553202} difficulty="core" />);
    answerTask(1, "×100", "235", "dag");
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź mnożnik, wartość, jednostkę i realizm" }));
    expect(screen.getByRole("status")).toHaveTextContent("2,35 kg = 235 dag");

    rerender(<DecimalNotationL1Lab key="wrong-comma" activity="unit-scale-mass" seed={553202} difficulty="core" />);
    answerTask(1, "×100", "23,5", "dag");
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź mnożnik, wartość, jednostkę i realizm" }));
    expect(screen.getByText("Kody diagnostyczne: DEC_PLACE_VALUE")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Sprawdź pozycję przecinka");
  });

  it("wykrywa absurdalną etykietę 45 kg dla pudełka tabletek", () => {
    const { rerender } = render(<DecimalNotationL1Lab activity="medicine-packing" seed={553203} difficulty="core" />);
    expect(screen.getByText(/Pudełko tabletek dla schroniska ma 45 g/u)).toBeInTheDocument();
    answerTask(1, "÷1000", "0.045", "kg");
    expect(screen.getByLabelText("Wynik liczbowy zadania 1")).toHaveValue("0,045");
    fireEvent.click(screen.getByRole("button", { name: "Etykieta jest absurdem" }));
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź mnożnik, wartość, jednostkę i realizm" }));
    expect(screen.getByRole("status")).toHaveTextContent("45 g = 0,045 kg");

    rerender(<DecimalNotationL1Lab key="wrong-realism" activity="medicine-packing" seed={553203} difficulty="core" />);
    answerTask(1, "÷1000", "0,045", "kg");
    fireEvent.click(screen.getByRole("button", { name: "Etykieta jest realistyczna" }));
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź mnożnik, wartość, jednostkę i realizm" }));
    expect(screen.getByText("Kody diagnostyczne: DEC_ESTIMATE_RANGE")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Sprawdź realizm etykiety");
  });

  it("rozwiązuje obok siebie długość i masę bez mieszania jednostek", () => {
    render(<DecimalNotationL1Lab activity="mixed-measurements" seed={553204} difficulty="core" />);
    answerTask(1, "÷1000", "1,25", "km");
    answerTask(2, "÷100", "2,35", "kg");
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź mnożnik, wartość, jednostkę i realizm" }));
    expect(screen.getByRole("status")).toHaveTextContent("1 km + 250 m = 1,25 km; 2 kg + 35 dag = 2,35 kg");
  });

  it("ocenia deterministyczny wariant challenge bez ujawniania answerSpec", () => {
    const onResultChange = vi.fn();
    const { container } = render(<DecimalNotationL1Lab activity="independent-mixed" seed={553205} taskSeed={553205} difficulty="challenge" onResultChange={onResultChange} />);
    answerTask(1, "÷1000", "0,075", "kg");
    answerTask(2, "×1000", "2075", "m");
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź mnożnik, wartość, jednostkę i realizm" }));
    expect(onResultChange).toHaveBeenLastCalledWith(true, "0,075 kg; 2075 m");
    expect(container.querySelector("[data-answer-spec='server-only']")).toBeInTheDocument();
    expect(container.textContent).not.toContain("answerSpec");
  });
});
