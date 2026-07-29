// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MapScaleLessonLab } from "@/components/lessons/everyday/MapScaleLessonLab";
import {
  FIND_SCALE_TASKS,
  MAP_DISTANCE_TASKS,
  READ_SCALE_TASKS,
  REAL_DISTANCE_TASKS,
} from "@/lib/math/everyday/mapScale";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("Skala na planach i mapach", () => {
  it("wyjaśnia skalę w obu kierunkach", () => {
    render(<MapScaleLessonLab activity="scale-guide" />);

    expect(screen.getByText("1 cm na mapie")).toBeInTheDocument();
    expect(screen.getByText("30 000 cm w terenie")).toBeInTheDocument();
    expect(screen.getByText("0,3 km")).toBeInTheDocument();
    expect(screen.getByText(/1 cm odpowiada 2 km/)).toHaveTextContent("1 : 200 000");
  });

  it("ma różne zadania i poprawne przykłady kluczowe", () => {
    const tasks = [
      ...READ_SCALE_TASKS,
      ...FIND_SCALE_TASKS,
      ...REAL_DISTANCE_TASKS,
      ...MAP_DISTANCE_TASKS,
    ];
    expect(new Set(tasks.map((task) => task.id)).size).toBe(tasks.length);
    expect(READ_SCALE_TASKS[0]).toMatchObject({ scaleDenominator: 30000, answer: 0.3, answerUnit: "km" });
    expect(FIND_SCALE_TASKS[0]).toMatchObject({ realDistance: "2 km", answer: 200000 });
  });

  it("blokuje pusty wynik", () => {
    const onResultChange = vi.fn();
    render(<MapScaleLessonLab activity="read-scale" onResultChange={onResultChange} />);

    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByRole("status")).toHaveTextContent("Uzupełnij wynik");
    expect(onResultChange).toHaveBeenLastCalledWith(null, "brak odpowiedzi");
  });

  it("wyłącza klawiaturę urządzenia i używa klawiatury lekcji", () => {
    render(<MapScaleLessonLab activity="find-scale" />);
    const input = screen.getByRole("textbox", { name: "Liczba po dwukropku w skali" });

    expect(input).toHaveAttribute("inputmode", "none");
    expect(input).toHaveAttribute("readonly");
    for (const digit of ["2", "0", "0", "0", "0", "0"]) {
      fireEvent.click(screen.getByRole("button", { name: digit }));
    }
    expect(input).toHaveValue("200000");
  });

  it("po poprawnej odpowiedzi przechodzi do kolejnego zadania w tym samym slajdzie", () => {
    vi.useFakeTimers();
    render(<MapScaleLessonLab activity="read-scale" />);

    fireEvent.click(screen.getByRole("button", { name: "0" }));
    fireEvent.click(screen.getByRole("button", { name: ", przecinek" }));
    fireEvent.click(screen.getByRole("button", { name: "3" }));
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByRole("status")).toHaveTextContent("Dobrze");

    act(() => vi.advanceTimersByTime(650));
    expect(screen.getByRole("heading", { name: /Skala planu wynosi 1 : 5000/ })).toBeInTheDocument();
    expect(screen.getByText((_, element) => element?.getAttribute("data-lesson-task-progress") === "true" && element.textContent === "Zadanie 2/6")).toBeInTheDocument();
  });

  it("po zmianie slajdu zeruje odpowiedź i wraca do pierwszego zadania", () => {
    const { rerender } = render(<MapScaleLessonLab activity="find-scale" readOnly />);

    fireEvent.click(screen.getByRole("button", { name: "Następne zadanie →" }));
    expect(screen.getByText((_, element) => element?.getAttribute("data-lesson-task-progress") === "true" && element.textContent === "Zadanie 2/5")).toBeInTheDocument();

    rerender(<MapScaleLessonLab activity="real-distance" readOnly />);
    expect(screen.getByRole("textbox", { name: "Wynik" })).toHaveValue("");
    expect(screen.getByRole("heading", { name: /Odległość na mapie wynosi 3 cm/ })).toBeInTheDocument();
    expect(screen.getByText((_, element) => element?.getAttribute("data-lesson-task-progress") === "true" && element.textContent === "Zadanie 1/5")).toBeInTheDocument();
  });

  it("w podglądzie nauczyciela pozwala wracać do wcześniejszych zadań", () => {
    render(<MapScaleLessonLab activity="real-distance" readOnly />);

    const previous = screen.getByRole("button", { name: "← Poprzednie zadanie" });
    expect(previous).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Następne zadanie →" }));
    expect(screen.getByText((_, element) => element?.getAttribute("data-lesson-task-progress") === "true" && element.textContent === "Zadanie 2/5")).toBeInTheDocument();
    fireEvent.click(previous);
    expect(screen.getByText((_, element) => element?.getAttribute("data-lesson-task-progress") === "true" && element.textContent === "Zadanie 1/5")).toBeInTheDocument();
  });

  it("pierwsze zadanie o odległości w terenie prowadzi przez obliczenie dla 1 cm", () => {
    vi.useFakeTimers();
    render(<MapScaleLessonLab activity="real-distance" />);

    const firstStep = screen.getByRole("textbox", { name: "Pierwszy krok obliczenia" });
    const answer = screen.getByRole("textbox", { name: "Wynik" });
    expect(firstStep).toHaveAttribute("inputmode", "none");
    expect(firstStep).toHaveAttribute("readonly");

    for (const key of ["0", ", przecinek", "5"]) fireEvent.click(screen.getByRole("button", { name: key }));
    fireEvent.click(answer);
    for (const key of ["1", ", przecinek", "5"]) fireEvent.click(screen.getByRole("button", { name: key }));
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByRole("status")).toHaveTextContent("Dobrze");
  });

  it("kolejne zadania o odległości mają puste pola na własne obliczenia", () => {
    render(<MapScaleLessonLab activity="map-distance" readOnly />);

    fireEvent.click(screen.getByRole("button", { name: "Następne zadanie →" }));
    expect(screen.getByRole("textbox", { name: "Obliczenie pomocnicze 1" })).toHaveValue("");
    expect(screen.getByRole("textbox", { name: "Obliczenie pomocnicze 2" })).toHaveValue("");
    expect(screen.getByRole("textbox", { name: "Wynik" })).toHaveValue("");
  });
});
