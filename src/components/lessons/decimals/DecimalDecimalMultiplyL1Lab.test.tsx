/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DecimalDecimalMultiplyL1Lab } from "@/components/lessons/decimals/DecimalDecimalMultiplyL1Lab";

afterEach(cleanup);

describe("DecimalDecimalMultiplyL1Lab", () => {
  it("pokazuje przykład z kropką, iloczynami częściowymi i liczbą miejsc po przecinku", () => {
    render(<DecimalDecimalMultiplyL1Lab activity="decimal-decimal-written" seed={558200} />);
    expect(screen.getByText("1,2 · 0,35")).toBeInTheDocument();
    expect(screen.getByText("12 · 35")).toBeInTheDocument();
    expect(screen.getByText(/1 miejsce \+ 2 miejsca = 3 miejsca/u)).toBeInTheDocument();
    expect(screen.getByLabelText("Mnożenie pisemne 1,2 razy 0,35")).toBeInTheDocument();
    expect(screen.getAllByLabelText(/Mała kratka/u).length).toBeGreaterThan(0);
  });

  it("pozwala uzupełnić wszystkie wymagane etapy jednym kalkulatorem", () => {
    const onResultChange = vi.fn();
    render(<DecimalDecimalMultiplyL1Lab activity="decimal-decimal-written" seed={558200} onResultChange={onResultChange} />);

    fireEvent.click(screen.getByRole("button", { name: "3" }));

    fireEvent.click(screen.getByRole("button", { name: "Iloczyn częściowy 1, kratka 1" }));
    fireEvent.click(screen.getByRole("button", { name: "6" }));
    fireEvent.click(screen.getByRole("button", { name: "0" }));

    fireEvent.click(screen.getByRole("button", { name: "Iloczyn częściowy 2, kratka 1" }));
    fireEvent.click(screen.getByRole("button", { name: "3" }));
    fireEvent.click(screen.getByRole("button", { name: "6" }));

    fireEvent.click(screen.getByRole("button", { name: "Wynik, kratka 1" }));
    fireEvent.click(screen.getByRole("button", { name: "0" }));
    fireEvent.click(screen.getByRole("button", { name: "4" }));
    fireEvent.click(screen.getByRole("button", { name: "2" }));
    fireEvent.click(screen.getAllByRole("button", { name: "Przesuń przecinek o jedno miejsce w lewo" })[0]!);
    fireEvent.click(screen.getAllByRole("button", { name: "Przesuń przecinek o jedno miejsce w lewo" })[0]!);
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));

    expect(onResultChange).toHaveBeenLastCalledWith(true, "0,42");
    expect(screen.getByText(/1,2 · 0,35 = 0,42/u)).toBeInTheDocument();
  });

  it("pokazuje w zadaniu tekstowym ilustrację, puste obliczenie i odpowiedź z jednostką", () => {
    render(<DecimalDecimalMultiplyL1Lab activity="decimal-decimal-story" seed={558300} questionNumber={1} questionCount={4} />);
    expect(screen.getByText(/Prostokątna rabata/u)).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /garden/u })).toBeInTheDocument();
    expect(screen.getByText("Schemat rozwiązania")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Odpowiedź do zadania tekstowego" })).toHaveTextContent("m²");
  });

  it("w mnożeniu w pamięci wpisuje cyfry, a przecinek przesuwa osobnym przyciskiem", () => {
    const onResultChange = vi.fn();
    render(<DecimalDecimalMultiplyL1Lab activity="decimal-decimal-mental" seed={558100} onResultChange={onResultChange} />);

    fireEvent.click(screen.getByRole("button", { name: "0" }));
    fireEvent.click(screen.getByRole("button", { name: "6" }));
    fireEvent.click(screen.getByRole("button", { name: "Przesuń przecinek o jedno miejsce w lewo" }));
    fireEvent.click(screen.getByRole("button", { name: "Przesuń przecinek o jedno miejsce w lewo" }));
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));

    expect(onResultChange).toHaveBeenLastCalledWith(true, "0,06");
  });

  it("zachowuje zero przed przecinkiem w wyniku 0,4 · 1,5", () => {
    const onResultChange = vi.fn();
    render(<DecimalDecimalMultiplyL1Lab activity="decimal-decimal-mental" seed={558101} onResultChange={onResultChange} />);

    fireEvent.click(screen.getByRole("button", { name: "6" }));
    fireEvent.click(screen.getByRole("button", { name: "0" }));
    fireEvent.click(screen.getByRole("button", { name: "Przesuń przecinek o jedno miejsce w lewo" }));
    fireEvent.click(screen.getByRole("button", { name: "Przesuń przecinek o jedno miejsce w lewo" }));
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));

    expect(onResultChange).toHaveBeenLastCalledWith(true, "0,60");
  });
});
