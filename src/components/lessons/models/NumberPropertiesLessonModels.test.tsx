// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  MultiplesLessonModel,
  segmentPixelWidth,
} from "@/components/lessons/models/MultiplesLessonModel";
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
  GCD_LCM_FACTOR_TASKS,
  GcdLcmFactorLessonModel,
} from "@/components/lessons/models/GcdLcmFactorLessonModel";
import {
  primeFactors,
  validateFactorLadder,
} from "@/components/lessons/models/PrimeFactorizationLessonModel";

afterEach(cleanup);

describe("modele własności liczb naturalnych", () => {
  it("sprawdza kompletny zestaw wielokrotności, włącznie z zerem", () => {
    const reporter = vi.fn();
    render(<MultiplesLessonModel seed={3} questionNumber={1} questionCount={3} onResultChange={reporter} />);
    reporter.mockClear();

    [0, 6, 12, 18, 24, 30, 36, 42].forEach((value) => {
      fireEvent.click(screen.getByRole("button", { name: String(value) }));
    });
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź zaznaczone liczby" }));

    expect(reporter).toHaveBeenLastCalledWith(true, "0, 6, 12, 18, 24, 30, 36, 42");
    expect(screen.getByRole("status")).toHaveTextContent("Wszystkie elementy pasują");
  });

  it("pokazuje trwałą klawiaturę ekranową na pierwszym slajdzie wielokrotności", () => {
    render(<MultiplesLessonModel seed={1} questionNumber={1} questionCount={2} />);

    const hero = document.querySelector('[data-lesson-hero="multiples"]');
    expect(hero).toContainElement(
      screen.getByRole("img", {
        name: "Chrupek przy jednakowych pudełkach kredek",
      }),
    );
    expect(hero?.nextElementSibling).toContainElement(
      screen.getByRole("heading", {
        name: "Pudełka kredek w pracowni Chrupka",
      }),
    );
    expect(screen.getByLabelText("Klawiatura do wpisywania wielokrotności")).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("1 pudełek — liczba kredek"));
    fireEvent.click(screen.getByRole("button", { name: "9" }));
    expect(screen.getByLabelText("1 pudełek — liczba kredek")).toHaveValue("9");
    expect(screen.getByLabelText("Klawiatura do wpisywania wielokrotności")).toBeInTheDocument();
  });

  it("umieszcza grafikę dzielników nad treścią pierwszego zadania", () => {
    render(<DivisorsLessonModel seed={1} />);

    const hero = document.querySelector('[data-lesson-hero="divisors"]');
    expect(hero).toContainElement(
      screen.getByRole("img", {
        name: "Chrupek układa kolorowe okrągłe odznaki w równych rzędach",
      }),
    );
    expect(hero?.nextElementSibling).toContainElement(
      screen.getByRole("heading", { name: "Odznaki w równych rzędach" }),
    );
  });

  it("pozwala dotykowo ułożyć pierwszą wspólną długość z całych odcinków", () => {
    const reporter = vi.fn();
    render(<MultiplesLessonModel seed={2} questionNumber={1} questionCount={2} onResultChange={reporter} />);
    reporter.mockClear();

    const fourTarget = screen.getByRole("button", { name: "Umieść odcinek 4 cm na pasku" });
    fireEvent.click(fourTarget);
    fireEvent.click(fourTarget);
    fireEvent.click(fourTarget);
    fireEvent.click(screen.getByRole("button", { name: "Wybierz odcinek 6 cm" }));
    const sixTarget = screen.getByRole("button", { name: "Umieść odcinek 6 cm na pasku" });
    fireEvent.click(sixTarget);
    fireEvent.click(sixTarget);

    const fourSegments = [...document.querySelectorAll<HTMLElement>('[data-segment-kind="a"]')];
    const sixSegments = [...document.querySelectorAll<HTMLElement>('[data-segment-kind="b"]')];
    expect(fourSegments).toHaveLength(3);
    expect(sixSegments).toHaveLength(2);
    expect(fourSegments.reduce((sum, segment) => sum + Number.parseFloat(segment.style.width), 0)).toBe(120);
    expect(sixSegments.reduce((sum, segment) => sum + Number.parseFloat(segment.style.width), 0)).toBe(120);
    expect(segmentPixelWidth(4) * 3).toBe(segmentPixelWidth(6) * 2);

    fireEvent.change(screen.getByLabelText("NWW długości 4 i 6"), { target: { value: "12" } });
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź ułożone paski" }));

    expect(reporter).toHaveBeenLastCalledWith(true, "3 × 4; 2 × 6; NWW=12");
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
    expect(document.querySelector("[data-divisibility-number-grid]")).toHaveClass("grid", "gap-3");
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

    expect(screen.getByRole("heading", { name: "Odkryj nazwisko matematyka" })).toBeInTheDocument();
    expect(screen.getByText("Jak rozwiązać szyfr?")).toBeInTheDocument();

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

  it("podświetla wspólne czynniki dla NWD, skreśla je dla NWW i sprawdza oba iloczyny", () => {
    const reporter = vi.fn();
    render(<GcdLcmFactorLessonModel seed={2} questionNumber={1} questionCount={3} onResultChange={reporter} />);
    reporter.mockClear();

    [6, 3, 1].forEach((value, index) => {
      fireEvent.change(screen.getByLabelText(`Pierwsza liczba, wynik dzielenia, wiersz ${index + 1}`), { target: { value: String(value) } });
    });
    [2, 2, 3].forEach((value, index) => {
      fireEvent.change(screen.getByLabelText(`Pierwsza liczba, dzielnik pierwszy, wiersz ${index + 1}`), { target: { value: String(value) } });
    });
    [9, 3, 1].forEach((value, index) => {
      fireEvent.change(screen.getByLabelText(`Druga liczba, wynik dzielenia, wiersz ${index + 1}`), { target: { value: String(value) } });
    });
    [2, 3, 3].forEach((value, index) => {
      fireEvent.change(screen.getByLabelText(`Druga liczba, dzielnik pierwszy, wiersz ${index + 1}`), { target: { value: String(value) } });
    });

    fireEvent.focus(screen.getByLabelText("NWD, czynnik iloczynu 1"));
    expect(screen.getByLabelText("Pierwsza liczba, dzielnik pierwszy, wiersz 1")).toHaveClass("bg-amber-200");
    expect(screen.getByLabelText("Druga liczba, dzielnik pierwszy, wiersz 2")).toHaveClass("bg-amber-200");
    [2, 3].forEach((value, index) => fireEvent.change(screen.getByLabelText(`NWD, czynnik iloczynu ${index + 1}`), { target: { value: String(value) } }));
    fireEvent.change(screen.getByLabelText("Wynik NWD liczb 12 i 18"), { target: { value: "6" } });

    fireEvent.focus(screen.getByLabelText("NWW, czynnik iloczynu 1"));
    expect(screen.getByLabelText("Pierwsza liczba, dzielnik pierwszy, wiersz 1")).toHaveClass("line-through");
    expect(screen.getByLabelText("Pierwsza liczba, dzielnik pierwszy, wiersz 2")).not.toHaveClass("line-through");
    [2, 3, 3, 2].forEach((value, index) => fireEvent.change(screen.getByLabelText(`NWW, czynnik iloczynu ${index + 1}`), { target: { value: String(value) } }));
    fireEvent.change(screen.getByLabelText("Wynik NWW liczb 12 i 18"), { target: { value: "36" } });
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź rozkłady i obliczenia" }));

    expect(reporter).toHaveBeenLastCalledWith(true, "12: 2×2×3; 18: 2×3×3; NWD=6; NWW=36");
    expect(screen.getByRole("status")).toHaveTextContent("NWD = 6, a NWW = 36");
  });

  it("dodaje dwa zadania samodzielne bez podświetlania i skreślania czynników", () => {
    expect(GCD_LCM_FACTOR_TASKS.slice(-2).map(({ a, b }) => [a, b])).toEqual([[30, 45], [28, 42]]);

    const firstIndependent = render(<GcdLcmFactorLessonModel seed={2} questionNumber={4} questionCount={5} />);
    expect(screen.getByRole("heading", { name: "NWD i NWW liczb 30 i 45" })).toBeInTheDocument();
    expect(screen.getByText(/Zadanie samodzielne/)).toBeInTheDocument();

    [2, 3, 5].forEach((value, index) => {
      fireEvent.change(screen.getByLabelText(`Pierwsza liczba, dzielnik pierwszy, wiersz ${index + 1}`), { target: { value: String(value) } });
    });
    [3, 3, 5].forEach((value, index) => {
      fireEvent.change(screen.getByLabelText(`Druga liczba, dzielnik pierwszy, wiersz ${index + 1}`), { target: { value: String(value) } });
    });

    fireEvent.focus(screen.getByLabelText("NWD, czynnik iloczynu 1"));
    const factorInputs = screen.getAllByLabelText(/dzielnik pierwszy/);
    expect(factorInputs.every((input) => !input.classList.contains("bg-amber-200"))).toBe(true);
    fireEvent.focus(screen.getByLabelText("NWW, czynnik iloczynu 1"));
    expect(factorInputs.every((input) => !input.classList.contains("line-through"))).toBe(true);

    firstIndependent.unmount();
    render(<GcdLcmFactorLessonModel seed={2} questionNumber={5} questionCount={5} />);
    expect(screen.getByRole("heading", { name: "NWD i NWW liczb 28 i 42" })).toBeInTheDocument();
    expect(screen.getAllByText("wybór samodzielny")).toHaveLength(2);
  });

  it("po wyborze NWD w zadaniu o paczkach pokazuje dwa rozkłady metodą kreski", () => {
    render(<GcdLcmFactorLessonModel seed={3} />);

    fireEvent.click(screen.getByRole("button", { name: "NWD" }));

    expect(screen.getByText("Teraz udowodnij wybór: rozłóż 48 i 60 metodą kreski, wpisz wspólne czynniki, ich iloczyn i liczbę paczek.")).toBeInTheDocument();
    expect(screen.getByText("Pierwsza liczba: 48")).toBeInTheDocument();
    expect(screen.getByText("Druga liczba: 60")).toBeInTheDocument();
  });
});
