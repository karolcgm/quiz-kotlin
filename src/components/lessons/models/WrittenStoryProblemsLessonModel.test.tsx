// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  STORY_PROBLEMS,
  WrittenStoryProblemsLessonModel,
} from "@/components/lessons/models/WrittenStoryProblemsLessonModel";

afterEach(cleanup);

function writtenScope() {
  const section = screen
    .getByText("Obliczenia pisemne — wpisz liczby i uzupełnij kratki")
    .closest("section");
  if (!section) throw new Error("Brak sekcji obliczeń pisemnych.");
  return within(section);
}

function enterDigits(
  scope: ReturnType<typeof within>,
  cells: HTMLElement[],
  digits: string,
) {
  expect(cells).toHaveLength(digits.length);
  digits.split("").forEach((digit, index) => {
    fireEvent.click(cells[index]!);
    fireEvent.click(scope.getByRole("button", { name: digit }));
  });
}

function completeAddSub(a: string, b: string, result: string) {
  const scope = writtenScope();
  enterDigits(
    scope,
    scope.getAllByRole("button", { name: /Pierwsza liczba, cyfra/ }),
    a,
  );
  enterDigits(
    scope,
    scope.getAllByRole("button", { name: /Druga liczba, cyfra/ }),
    b,
  );
  enterDigits(
    scope,
    scope.getAllByRole("button", { name: /Wynik, kolumna/ }),
    result,
  );
}

describe("WrittenStoryProblemsLessonModel", () => {
  it("zastępuje bibliotekę historią o grze i pokazuje puste liczby dodawania", () => {
    expect(STORY_PROBLEMS[0].writtenOperation).toEqual({
      kind: "add-sub",
      a: 3486,
      b: 2759,
      subtract: false,
    });
    expect(STORY_PROBLEMS[0].modelPlan).toBe("3486 + 2759 = 6245.");

    render(<WrittenStoryProblemsLessonModel seed={1} />);

    expect(
      screen.getByRole("heading", {
        name: "Nowi gracze w komputerowej krainie",
      }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/bibliote/i)).not.toBeInTheDocument();
    const scope = writtenScope();
    scope
      .getAllByRole("button", { name: /(Pierwsza|Druga) liczba, cyfra/ })
      .forEach((cell) => expect(cell).toBeEmptyDOMElement());
  });

  it("zgłasza poprawne dodawanie dopiero po wpisaniu obu liczb i wyniku", () => {
    const reporter = vi.fn();
    render(
      <WrittenStoryProblemsLessonModel seed={1} onResultChange={reporter} />,
    );
    reporter.mockClear();

    completeAddSub("3486", "2759", "6245");
    fireEvent.change(screen.getByLabelText("Wynik zadania tekstowego"), {
      target: { value: "6245" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Sprawdź rozwiązanie" }),
    );

    expect(reporter).toHaveBeenLastCalledWith(
      true,
      "3486 + 2759 = 6245 | 6245",
    );
  });

  it("w odejmowaniu wymaga potrzebnych danych oraz wpisania obu liczb", () => {
    const reporter = vi.fn();
    render(
      <WrittenStoryProblemsLessonModel seed={2} onResultChange={reporter} />,
    );
    reporter.mockClear();

    fireEvent.click(
      screen.getByRole("button", { name: "7250 przygotowanych biletów" }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "3687 sprzedanych biletów" }),
    );
    completeAddSub("7250", "3687", "3563");
    fireEvent.change(screen.getByLabelText("Wynik zadania tekstowego"), {
      target: { value: "3563" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Sprawdź rozwiązanie" }),
    );

    expect(reporter).toHaveBeenLastCalledWith(
      true,
      "7250 − 3687 = 3563 | 3563",
    );
  });

  it("dodaje zadanie tekstowe na mnożenie z całkowicie pustą planszą", () => {
    const reporter = vi.fn();
    render(
      <WrittenStoryProblemsLessonModel seed={3} onResultChange={reporter} />,
    );
    reporter.mockClear();
    const scope = writtenScope();
    const first = scope.getAllByRole("button", {
      name: /Pierwsza liczba, cyfra/,
    });
    const second = scope.getAllByRole("button", {
      name: /Druga liczba, cyfra/,
    });
    [...first, ...second].forEach((cell) => expect(cell).toBeEmptyDOMElement());

    enterDigits(scope, first, "248");
    enterDigits(scope, second, "36");
    enterDigits(
      scope,
      scope.getAllByRole("button", { name: /Wynik końcowy, cyfra/ }),
      "8928",
    );
    fireEvent.change(screen.getByLabelText("Wynik zadania tekstowego"), {
      target: { value: "8928" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Sprawdź rozwiązanie" }),
    );

    expect(reporter).toHaveBeenLastCalledWith(true, "248 × 36 = 8928 | 8928");
  });

  it("dodaje zadanie tekstowe na dzielenie z pustą dzielną i dzielnikiem", () => {
    const reporter = vi.fn();
    render(
      <WrittenStoryProblemsLessonModel seed={4} onResultChange={reporter} />,
    );
    reporter.mockClear();
    const scope = writtenScope();
    const dividend = scope.getAllByRole("button", { name: /Dzielna, cyfra/ });
    const divisor = scope.getAllByRole("button", { name: /Dzielnik, cyfra/ });
    [...dividend, ...divisor].forEach((cell) =>
      expect(cell).toBeEmptyDOMElement(),
    );

    enterDigits(scope, dividend, "1248");
    enterDigits(scope, divisor, "24");
    enterDigits(
      scope,
      scope.getAllByRole("button", { name: /Iloraz końcowy, cyfra/ }),
      "52",
    );
    enterDigits(
      scope,
      scope.getAllByRole("button", { name: /Reszta końcowa, cyfra/ }),
      "0",
    );
    fireEvent.change(screen.getByLabelText("Wynik zadania tekstowego"), {
      target: { value: "52" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Sprawdź rozwiązanie" }),
    );

    expect(reporter).toHaveBeenLastCalledWith(true, "1248 : 24 = 52 | 52");
  });
});
