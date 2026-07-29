// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MeasurementUnitsLessonLab } from "@/components/lessons/everyday/MeasurementUnitsLessonLab";
import {
  LENGTH_CONVERSION_TASKS,
  MASS_CONVERSION_TASKS,
  PRICE_PER_KILOGRAM_TASKS,
} from "@/lib/math/everyday/measurementUnits";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("Jednostki długości i jednostki masy", () => {
  it("ma niepowtarzające się polecenia i uwzględnia miligramy", () => {
    const prompts = [
      ...LENGTH_CONVERSION_TASKS,
      ...MASS_CONVERSION_TASKS,
      ...PRICE_PER_KILOGRAM_TASKS,
    ].map((task) => task.prompt);
    expect(new Set(prompts).size).toBe(prompts.length);
    expect(MASS_CONVERSION_TASKS.some((task) => task.prompt.includes("mg") || task.fields.some((field) => field.unit === "mg"))).toBe(true);
  });

  it("blokuje pusty wynik", () => {
    const onResultChange = vi.fn();
    render(<MeasurementUnitsLessonLab activity="length-conversions" onResultChange={onResultChange} />);

    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByRole("status")).toHaveTextContent("Uzupełnij wszystkie wyniki");
    expect(onResultChange).toHaveBeenLastCalledWith(null, "brak odpowiedzi");
  });

  it("pola liczbowe wyłączają klawiaturę urządzenia i używają klawiatury lekcji", () => {
    render(<MeasurementUnitsLessonLab activity="mass-conversions" />);
    const input = screen.getByRole("textbox", { name: "Wynik" });

    expect(input).toHaveAttribute("inputmode", "none");
    expect(input).toHaveAttribute("readonly");
    for (const digit of ["2", "4", "0", "0"]) fireEvent.click(screen.getByRole("button", { name: digit }));
    expect(input).toHaveValue("2400");
  });

  it("po poprawnej odpowiedzi pokazuje następne zadanie na tym samym slajdzie", () => {
    vi.useFakeTimers();
    render(<MeasurementUnitsLessonLab activity="length-conversions" />);

    for (const digit of ["3", "4", "0", "0"]) fireEvent.click(screen.getByRole("button", { name: digit }));
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByRole("status")).toHaveTextContent("Dobrze");

    act(() => vi.advanceTimersByTime(650));
    expect(screen.getByRole("heading", { name: "Zamień 2,75 m na centymetry." })).toBeInTheDocument();
    expect(screen.getByText((_, element) => element?.getAttribute("data-lesson-task-progress") === "true" && element.textContent === "Zadanie 2/7")).toBeInTheDocument();
  });

  it("zadanie zakupowe wymaga obu wyników i pokazuje grafikę produktu nad treścią", () => {
    render(<MeasurementUnitsLessonLab activity="price-per-kilogram" />);

    expect(screen.getByRole("img", { name: "Łubianka świeżych jagód" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Liczba porcji w 1 kg" })).toHaveAttribute("readonly");
    expect(screen.getByRole("textbox", { name: "Cena 1 kg" })).toHaveAttribute("readonly");
  });
});
