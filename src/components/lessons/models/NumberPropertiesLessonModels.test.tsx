// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MultiplesLessonModel } from "@/components/lessons/models/MultiplesLessonModel";
import { DivisorsLessonModel } from "@/components/lessons/models/DivisorsLessonModel";
import {
  DIVISIBILITY_ROUNDS,
  DivisibilityAnimalsLessonModel,
  createDivisibilityRound,
} from "@/components/lessons/models/DivisibilityAnimalsLessonModel";

afterEach(cleanup);

describe("modele własności liczb naturalnych", () => {
  it("sprawdza kompletny zestaw wielokrotności, włącznie z zerem", () => {
    const reporter = vi.fn();
    render(<MultiplesLessonModel seed={2} questionNumber={1} questionCount={3} onResultChange={reporter} />);
    reporter.mockClear();

    [0, 6, 12, 18, 24, 30, 36, 42].forEach((value) => {
      fireEvent.click(screen.getByRole("button", { name: String(value) }));
    });
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź zaznaczone liczby" }));

    expect(reporter).toHaveBeenLastCalledWith(true, "0, 6, 12, 18, 24, 30, 36, 42");
    expect(screen.getByRole("status")).toHaveTextContent("Wszystkie elementy pasują");
  });

  it("sprawdza wszystkie dzielniki liczby z centrum", () => {
    const reporter = vi.fn();
    render(<DivisorsLessonModel seed={2} questionNumber={1} questionCount={3} onResultChange={reporter} />);
    reporter.mockClear();

    [1, 2, 3, 6, 9, 18].forEach((value) => {
      fireEvent.click(screen.getByRole("button", { name: String(value) }));
    });
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź zaznaczone dzielniki" }));

    expect(reporter).toHaveBeenLastCalledWith(true, "1, 2, 3, 6, 9, 18");
    expect(screen.getByRole("status")).toHaveTextContent("bez reszty");
  });

  it("tworzy dla każdej cechy dokładnie 25 różnych liczb i 10 odpowiedzi", () => {
    for (const round of DIVISIBILITY_ROUNDS) {
      const data = createDivisibilityRound(round.divisor, 2026 + round.divisor);
      expect(data.numbers).toHaveLength(25);
      expect(new Set(data.numbers)).toHaveLength(25);
      expect(data.correctNumbers).toHaveLength(10);
      expect(data.correctNumbers.every((value) => value % round.divisor === 0)).toBe(true);
      expect(data.numbers.filter((value) => value < 10).length, `dzielnik ${round.divisor}: liczby jednocyfrowe`).toBeGreaterThan(0);
      expect(data.numbers.some((value) => value >= 10 && value < 100), `dzielnik ${round.divisor}: liczby dwucyfrowe`).toBe(true);
      expect(data.numbers.some((value) => value >= 100), `dzielnik ${round.divisor}: liczby trzycyfrowe`).toBe(true);
    }
  });

  it("plansza zwierzęcia ma 25 dostępnych baloników i akceptuje tylko pełny zestaw", () => {
    const reporter = vi.fn();
    const taskSeed = 31415;
    const round = DIVISIBILITY_ROUNDS[0]!;
    const data = createDivisibilityRound(round.divisor, taskSeed + round.divisor * 1009);
    render(<DivisibilityAnimalsLessonModel taskSeed={taskSeed} questionNumber={1} questionCount={7} onResultChange={reporter} />);
    reporter.mockClear();

    expect(screen.getAllByRole("button", { name: /Liczba \d+/ })).toHaveLength(25);
    data.correctNumbers.forEach((value) => fireEvent.click(screen.getByRole("button", { name: `Liczba ${value}` })));
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź zestaw" }));

    expect(reporter).toHaveBeenLastCalledWith(true, data.correctNumbers.join(", "));
    expect(screen.getByRole("status")).toHaveTextContent("otwiera następną planszę");
  });
});
