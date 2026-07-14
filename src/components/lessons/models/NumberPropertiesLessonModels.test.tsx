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
import {
  isComposite,
  isPrime,
  PRIME_CIPHER_TASKS,
  PrimeCompositeLessonModel,
} from "@/components/lessons/models/PrimeCompositeLessonModel";
import {
  GcdLcmFactorLessonModel,
  gcd,
  lcm,
  NUMBER_PROPERTIES_PASSWORD,
  NWD_PASSWORD_TASKS,
  NWW_PASSWORD_TASKS,
} from "@/components/lessons/models/GcdLcmFactorLessonModel";
import {
  primeFactors,
  validateFactorLadder,
} from "@/components/lessons/models/PrimeFactorizationLessonModel";

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

  it("pokazuje trwałą klawiaturę ekranową na pierwszym slajdzie wielokrotności", () => {
    render(<MultiplesLessonModel seed={1} />);

    expect(screen.getByLabelText("Klawiatura do wpisywania liczb")).toBeInTheDocument();
    expect(screen.getByLabelText("Klawiatura do odpowiedzi o odcinkach")).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("1 pudełek kredek"));
    fireEvent.click(screen.getAllByRole("button", { name: "9" })[0]!);
    expect(screen.getByLabelText("1 pudełek kredek")).toHaveValue("9");
    expect(screen.getByLabelText("Klawiatura do wpisywania liczb")).toBeInTheDocument();
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

  it("rozróżnia liczby pierwsze, złożone oraz przypadki 0 i 1", () => {
    expect([2, 3, 5, 7, 11, 13].every(isPrime)).toBe(true);
    expect([4, 6, 8, 9, 12, 15].every(isComposite)).toBe(true);
    expect(isPrime(0)).toBe(false);
    expect(isPrime(1)).toBe(false);
    expect(isComposite(0)).toBe(false);
    expect(isComposite(1)).toBe(false);
  });

  it("akceptuje pełną rozsypankę liczb pierwszych", () => {
    const reporter = vi.fn();
    render(<PrimeCompositeLessonModel seed={2} questionNumber={1} questionCount={2} onResultChange={reporter} />);
    reporter.mockClear();

    [2, 3, 5, 7, 11, 13, 17, 19, 23, 29].forEach((value) => {
      fireEvent.click(screen.getByRole("button", { name: String(value) }));
    });
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź rozsypankę" }));

    expect(reporter).toHaveBeenLastCalledWith(true, "2, 3, 5, 7, 11, 13, 17, 19, 23, 29");
  });

  it("w pierwszej rundzie szyfru przyjmuje pełny zestaw liczb złożonych", () => {
    const reporter = vi.fn();
    const task = PRIME_CIPHER_TASKS[0]!;
    render(<PrimeCompositeLessonModel seed={3} questionNumber={1} questionCount={2} onResultChange={reporter} />);
    reporter.mockClear();

    task.tiles
      .filter((tile) => isComposite(tile.number))
      .forEach((tile) => fireEvent.click(screen.getByRole("button", { name: `Liczba ${tile.number}, litera ${tile.letter}` })));
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź szyfr" }));

    expect(reporter).toHaveBeenLastCalledWith(
      true,
      task.tiles
        .filter((tile) => isComposite(tile.number))
        .map((tile) => tile.number)
        .sort((a, b) => a - b)
        .join(", "),
    );
    expect(screen.getByRole("status")).toHaveTextContent("EUKLIDES");
  });

  it("w drugiej rundzie szyfru przyjmuje pełny zestaw liczb pierwszych", () => {
    const reporter = vi.fn();
    const task = PRIME_CIPHER_TASKS[1]!;
    render(<PrimeCompositeLessonModel seed={3} questionNumber={2} questionCount={2} onResultChange={reporter} />);
    reporter.mockClear();

    task.tiles
      .filter((tile) => isPrime(tile.number))
      .forEach((tile) => fireEvent.click(screen.getByRole("button", { name: `Liczba ${tile.number}, litera ${tile.letter}` })));
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź szyfr" }));

    expect(reporter).toHaveBeenLastCalledWith(
      true,
      task.tiles
        .filter((tile) => isPrime(tile.number))
        .map((tile) => tile.number)
        .sort((a, b) => a - b)
        .join(", "),
    );
    expect(screen.getByRole("status")).toHaveTextContent("EUKLIDES Z ALEKSANDRII");
  });

  it("sprawdza rozkład metodą pionowej kreski aż do liczby 1", () => {
    expect(primeFactors(420)).toEqual([2, 2, 3, 5, 7]);
    expect(validateFactorLadder(420, ["210", "105", "35", "7", "1"], ["2", "2", "3", "5", "7"])).toBe(true);
    expect(validateFactorLadder(420, ["84", "28", "14", "7", "1"], ["5", "3", "2", "2", "7"])).toBe(true);
    expect(validateFactorLadder(420, ["210", "70", "14", "3", "1"], ["2", "3", "5", "7", "2"])).toBe(false);
  });

  it("odczytuje hasło po poprawnym obliczeniu NWD, NWW i rozkładu 210", () => {
    const reporter = vi.fn();
    render(<GcdLcmFactorLessonModel seed={4} onResultChange={reporter} />);
    reporter.mockClear();

    NWD_PASSWORD_TASKS.forEach((task) => {
      fireEvent.change(screen.getByLabelText(`NWD liczb ${task.a} i ${task.b}`), {
        target: { value: String(gcd(task.a, task.b)) },
      });
    });
    [2, 3, 5, 7].forEach((factor, index) => {
      fireEvent.change(screen.getByLabelText(`Czynnik pierwszy ${index + 1} liczby 210`), {
        target: { value: String(factor) },
      });
    });
    NWW_PASSWORD_TASKS.forEach((task) => {
      fireEvent.change(screen.getByLabelText(`NWW liczb ${task.a} i ${task.b}`), {
        target: { value: String(lcm(task.a, task.b)) },
      });
    });
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź i odczytaj hasło" }));

    expect(reporter).toHaveBeenLastCalledWith(true, NUMBER_PROPERTIES_PASSWORD);
    expect(screen.getByRole("status")).toHaveTextContent(NUMBER_PROPERTIES_PASSWORD);
  });
});
