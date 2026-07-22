/** @vitest-environment jsdom */
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  IntegerAddSubtractLessonLab,
  integerAddSubtractActivityFromStageId,
} from "@/components/lessons/models/IntegerAddSubtractLessonLab";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("IntegerAddSubtractLessonLab", () => {
  it("zaczyna od znaków przy nawiasach i automatycznie przechodzi do kolejnego zadania", () => {
    vi.useFakeTimers();
    render(<IntegerAddSubtractLessonLab activity="signs" />);

    expect(screen.getByText("Zadanie 1/4")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "5 − 2" }));
    expect(screen.getByRole("status")).toHaveTextContent("Plus obok minusa");
    act(() => vi.advanceTimersByTime(850));
    expect(screen.getByText("Zadanie 2/4")).toBeInTheDocument();
  });

  it("zamienia plus obok minusa na minus po usunięciu nawiasu", () => {
    vi.useFakeTimers();
    render(<IntegerAddSubtractLessonLab activity="signs" />);

    fireEvent.click(screen.getByRole("button", { name: "5 − 2" }));
    act(() => vi.advanceTimersByTime(850));
    fireEvent.click(screen.getByRole("button", { name: "−8 + 4" }));
    act(() => vi.advanceTimersByTime(850));
    fireEvent.click(screen.getByRole("button", { name: "+" }));
    act(() => vi.advanceTimersByTime(850));

    expect(screen.getByText("−6 + (−5)")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "−" }));
    expect(screen.getByRole("status")).toHaveTextContent("−6 − 5");
  });

  it("po zmianie slajdu z wyborem odpowiedzi zaczyna nową serię od zadania 1", () => {
    vi.useFakeTimers();
    const { rerender } = render(<IntegerAddSubtractLessonLab activity="signs" />);

    fireEvent.click(screen.getByRole("button", { name: "5 − 2" }));
    act(() => vi.advanceTimersByTime(850));
    expect(screen.getByText("Zadanie 2/4")).toBeInTheDocument();

    rerender(<IntegerAddSubtractLessonLab activity="different-signs" />);
    expect(screen.getByText("Zadanie 1/4")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "8 − 5 i znak ujemny" })).not.toBeDisabled();
  });

  it("pozwala dodawać dodatnie i ujemne żetony do worków oraz skreślać parę przeciwną", () => {
    render(<IntegerAddSubtractLessonLab activity="different-signs" />);

    expect(screen.getByLabelText("Dodatnie: 5")).toBeInTheDocument();
    expect(screen.getByLabelText("Ujemne: 8")).toBeInTheDocument();
    expect(screen.getByText("-3")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Dodaj +1" }));
    expect(screen.getByLabelText("Dodatnie: 6")).toBeInTheDocument();
    expect(screen.getByText("-2")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Skreśl parę +1 i −1" }));
    expect(screen.getByLabelText("Dodatnie: 5")).toBeInTheDocument();
    expect(screen.getByLabelText("Ujemne: 7")).toBeInTheDocument();
    expect(screen.getByText("-2")).toBeInTheDocument();
  });

  it("pozwala wpisać wynik tylko klawiaturą lekcyjną i pokazać ruch po osi", () => {
    render(<IntegerAddSubtractLessonLab activity="practice" />);

    const answer = screen.getByLabelText("Wynik działania −6 + 8");
    expect(answer).toHaveAttribute("inputmode", "none");
    expect(answer).toHaveAttribute("readonly");
    fireEvent.click(screen.getByRole("button", { name: "Jeden krok" }));
    expect(screen.getByText("Krok 1/8 · -5")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "2" }));
    expect(answer).toHaveValue("2");
  });

  it("resetuje ruch osi przy kolejnym działaniu, także dla 11 − (−7)", () => {
    vi.useFakeTimers();
    render(<IntegerAddSubtractLessonLab activity="practice" />);

    fireEvent.click(screen.getByRole("button", { name: "2" }));
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
    act(() => vi.advanceTimersByTime(850));

    fireEvent.click(screen.getByRole("button", { name: "−" }));
    fireEvent.click(screen.getByRole("button", { name: "3" }));
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
    act(() => vi.advanceTimersByTime(850));

    fireEvent.click(screen.getByRole("button", { name: "−" }));
    fireEvent.click(screen.getByRole("button", { name: "9" }));
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
    act(() => vi.advanceTimersByTime(850));

    expect(screen.getByRole("img", { name: "Ruch od 11 do 18 po osi" })).toBeInTheDocument();
    expect(screen.getByText("Krok 0/7 · 11")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Jeden krok" }));
    expect(screen.getByText("Krok 1/7 · 12")).toBeInTheDocument();
  });

  it("w zadaniu o długu wymaga samodzielnego zapisu liczb ze znakami", () => {
    render(<IntegerAddSubtractLessonLab activity="stories" />);

    const first = screen.getByLabelText("Pierwsza liczba w działaniu");
    const second = screen.getByLabelText("Druga liczba w działaniu");
    const result = screen.getByLabelText("Wynik działania");
    for (const field of [first, second, result]) {
      expect(field).toHaveAttribute("inputmode", "none");
      expect(field).toHaveAttribute("readonly");
    }
    fireEvent.click(first);
    fireEvent.click(screen.getByRole("button", { name: "9" }));
    fireEvent.click(second);
    fireEvent.click(screen.getByRole("button", { name: "−" }));
    fireEvent.click(screen.getByRole("button", { name: "1" }));
    fireEvent.click(screen.getByRole("button", { name: "4" }));
    fireEvent.click(result);
    fireEvent.click(screen.getByRole("button", { name: "−" }));
    fireEvent.click(screen.getByRole("button", { name: "5" }));
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByRole("status")).toHaveTextContent("Dobrze");
  });

  it("rozpoznaje wszystkie sześć etapów połączonego tematu", () => {
    expect(integerAddSubtractActivityFromStageId("m5-7-2-dodawanie-odejmowanie-v1-s1")).toBe("signs");
    expect(integerAddSubtractActivityFromStageId("m5-7-2-dodawanie-odejmowanie-v1-s2")).toBe("different-signs");
    expect(integerAddSubtractActivityFromStageId("m5-7-2-dodawanie-odejmowanie-v1-s3")).toBe("same-signs");
    expect(integerAddSubtractActivityFromStageId("m5-7-2-dodawanie-odejmowanie-v1-s4")).toBe("subtraction");
    expect(integerAddSubtractActivityFromStageId("m5-7-2-dodawanie-odejmowanie-v1-s5")).toBe("practice");
    expect(integerAddSubtractActivityFromStageId("m5-7-2-dodawanie-odejmowanie-v1-s6")).toBe("stories");
  });
});
