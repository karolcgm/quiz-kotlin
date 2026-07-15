/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FractionDifferentDenominatorMeasureLessonModel } from "@/components/lessons/fractions/FractionDifferentDenominatorMeasureLessonModel";

afterEach(cleanup);

describe("FractionDifferentDenominatorMeasureLessonModel", () => {
  it("zatrzymuje przedwczesne dodawanie różnych miar", () => {
    render(<FractionDifferentDenominatorMeasureLessonModel activity="different-denom-glasses-discover" seed={36061} />);
    fireEvent.click(screen.getByRole("button", { name: "Spróbuj połączyć porcje" }));
    expect(screen.getByRole("status")).toHaveTextContent("trzecie i czwarte części nie są tą samą miarą");
  });

  it("zmienia podziałkę na dwunaste bez zmiany wartości porcji", () => {
    const { container } = render(<FractionDifferentDenominatorMeasureLessonModel activity="different-denom-glasses-twelfths" seed={36062} />);
    fireEvent.click(screen.getByRole("button", { name: "Dwunaste" }));
    expect(screen.getByRole("status")).toHaveTextContent("1/3 = 4/12 · 1/4 = 3/12 · poziomy bez zmiany");
    expect(container.querySelector("[data-identical-capacity='true']")).toBeInTheDocument();
  });

  it("obrazuje przelanie jako 4/12 + 3/12 = 7/12", () => {
    const { container } = render(<FractionDifferentDenominatorMeasureLessonModel activity="different-denom-glasses-pour" seed={36063} />);
    fireEvent.click(screen.getByRole("button", { name: "Przelej 4/12 i 3/12" }));
    expect(screen.getByRole("status")).toHaveTextContent("4/12 + 3/12 = 7/12");
    expect(container.querySelector("[data-poured='true']")).toBeInTheDocument();
  });

  it("podświetla konkretny brak wspólnego mianownika w trybie ćwiczenia", () => {
    const { container } = render(<FractionDifferentDenominatorMeasureLessonModel activity="different-denom-algorithm" seed={36064} />);
    fireEvent.change(screen.getByLabelText("licznik, cyfra 1 z 1"), { target: { value: "7" } });
    fireEvent.change(screen.getByLabelText("mianownik, cyfra 1 z 1"), { target: { value: "1" } });
    fireEvent.change(screen.getByLabelText("mianownik, cyfra 2 z 2"), { target: { value: "2" } });
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź wszystkie cztery wiersze" }));
    expect(screen.getByRole("heading", { name: "Odpowiedź wymaga poprawy" })).toBeInTheDocument();
    expect(container.querySelector("[data-diagnostic-code='FRA_NO_COMMON_DENOMINATOR']")).toBeInTheDocument();
    expect(screen.getAllByText(/Wybrana miara nie dzieli obu mianowników/).length).toBeGreaterThan(0);
  });

  it("akceptuje cztery poprawne wiersze i zgłasza wynik do oceny", () => {
    const onResultChange = vi.fn();
    const { container } = render(
      <FractionDifferentDenominatorMeasureLessonModel
        activity="different-denom-algorithm"
        seed={36064}
        onResultChange={onResultChange}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "12" }));
    for (const [memberId, value] of [
      ["left-numerator-multiplier", "4"],
      ["left-denominator-multiplier", "4"],
      ["right-numerator-multiplier", "3"],
      ["right-denominator-multiplier", "3"],
    ] as const) {
      fireEvent.change(container.querySelector(`[data-member-id='${memberId}']`)!, { target: { value } });
    }
    fireEvent.change(screen.getByLabelText("licznik, cyfra 1 z 1"), { target: { value: "7" } });
    fireEvent.change(screen.getByLabelText("mianownik, cyfra 1 z 1"), { target: { value: "1" } });
    fireEvent.change(screen.getByLabelText("mianownik, cyfra 2 z 2"), { target: { value: "2" } });
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź wszystkie cztery wiersze" }));

    expect(screen.getByText(/Wspólna miara 12, poprawne rozszerzenia/)).toBeInTheDocument();
    expect(onResultChange).toHaveBeenLastCalledWith(true, "1/3 + 1/4 = 7/12");
  });
});
