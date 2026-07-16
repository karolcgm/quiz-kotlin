/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FractionDifferentDenominatorAdvancedLessonModel } from "@/components/lessons/fractions/FractionDifferentDenominatorAdvancedLessonModel";

afterEach(cleanup);

function enterKeypadStep(label: string, digits: string[]) {
  const keypad = screen.getByLabelText(label);
  for (const digit of digits) fireEvent.click(within(keypad).getByRole("button", { name: digit }));
  fireEvent.click(within(keypad).getByRole("button", { name: "Zatwierdź" }));
}

function chooseCommon(value: string) {
  fireEvent.click(within(screen.getByRole("group", { name: "Wspólny mianownik L2" })).getByRole("button", { name: value }));
}

describe("FractionDifferentDenominatorAdvancedLessonModel", () => {
  it("pokazuje na równych paskach wspólną miarę i wynik dodawania", () => {
    const { container } = render(<FractionDifferentDenominatorAdvancedLessonModel activity="different-denom-l2-subtraction-bars" seed={1} />);
    const keypad = screen.getByLabelText("Kalkulator do dodawania o różnych mianownikach");
    fireEvent.click(within(keypad).getByRole("button", { name: "3" }));
    fireEvent.click(within(keypad).getByRole("button", { name: "2" }));
    fireEvent.click(within(keypad).getByRole("button", { name: "5" }));
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź rozwiązanie" }));
    expect(screen.getByText(/Poprawnie: oba ułamki zapisano/)).toBeInTheDocument();
    expect(container.querySelector("[data-fraction-bar='result']")).toBeInTheDocument();
  });

  it("zgłasza poprawny wynik odejmowania do oceny", () => {
    const onResultChange = vi.fn();
    render(<FractionDifferentDenominatorAdvancedLessonModel activity="different-denom-l2-mixed-number" seed={2} onResultChange={onResultChange} />);
    const keypad = screen.getByLabelText("Kalkulator do odejmowania o różnych mianownikach");
    expect(screen.getByLabelText("Pierwszy licznik, cyfra 1 z 2")).toHaveAttribute("inputmode", "none");
    expect(screen.getByLabelText("Pierwszy licznik, cyfra 2 z 2")).toHaveValue("");
    expect(screen.getByLabelText("Drugi licznik, cyfra 1 z 1")).toHaveValue("");
    expect(screen.getByLabelText("Licznik wyniku, cyfra 1 z 1")).toHaveValue("");
    for (const digit of ["1", "0", "3", "7"]) fireEvent.click(within(keypad).getByRole("button", { name: digit }));
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź rozwiązanie" }));
    expect(onResultChange).toHaveBeenLastCalledWith(true, "5/6 − 1/4 = 7/12");
  });

  it("łączy obliczenie mikstury z oceną, że wynik przekracza litr", () => {
    const { container } = render(<FractionDifferentDenominatorAdvancedLessonModel activity="different-denom-l2-greenhouse" seed={3} />);
    fireEvent.click(screen.getByRole("button", { name: "więcej niż 1 l" }));
    chooseCommon("12");
    enterKeypadStep("Kalkulator do mikstury w szklarni", ["8", "1", "2"]);
    enterKeypadStep("Kalkulator do mikstury w szklarni", ["9", "1", "2"]);
    enterKeypadStep("Kalkulator do mikstury w szklarni", ["1", "7", "1", "2"]);
    enterKeypadStep("Kalkulator do mikstury w szklarni", ["1", "5", "1", "2"]);
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź całe rozwiązanie" }));
    expect(screen.getByText(/Poprawnie: wybrano wspólną miarę 12/)).toBeInTheDocument();
    expect(container.querySelector("[data-greenhouse-mixture] [data-member-id='greenhouse-level']")).toBeInTheDocument();
    expect(container.querySelectorAll("[data-stepwise-fraction-workspace]")).toHaveLength(1);
  });

  it("przekreśla 3/7 po wskazaniu dodawania mianowników i pozwala naprawić wynik", () => {
    const { container } = render(<FractionDifferentDenominatorAdvancedLessonModel activity="different-denom-l2-repair" seed={4} />);
    fireEvent.click(screen.getByRole("button", { name: "Dodano mianowniki: 3 + 4 = 7" }));
    expect(container.querySelector("[data-member-id='repair-wrong-denominator']")).toHaveClass("line-through");
    expect(container.querySelector("[data-smart-different-denominator-operation]")).not.toBeInTheDocument();
    const commonKeypad = screen.getByLabelText("Kalkulator wspólnego mianownika do naprawy");
    fireEvent.click(within(commonKeypad).getByRole("button", { name: "1" }));
    fireEvent.click(within(commonKeypad).getByRole("button", { name: "2" }));
    expect(container.querySelectorAll("[data-lesson-numeric-keypad='shared']")).toHaveLength(1);
    enterKeypadStep("Kalkulator do naprawy rozwiązania", ["8", "1", "2"]);
    enterKeypadStep("Kalkulator do naprawy rozwiązania", ["3", "1", "2"]);
    enterKeypadStep("Kalkulator do naprawy rozwiązania", ["1", "1", "1", "2"]);
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź całe rozwiązanie" }));
    expect(screen.getByText(/Poprawnie: wybrano wspólną miarę 12/)).toBeInTheDocument();
    expect(container.querySelectorAll("[data-stepwise-fraction-workspace]")).toHaveLength(1);
  });

  it("zachowuje zadanie pierwsze o koszu z jabłkami i używa jednego kalkulatora w zadaniu drugim", () => {
    render(<FractionDifferentDenominatorAdvancedLessonModel activity="different-denom-l2-apples" seed={5} />);
    fireEvent.click(screen.getByRole("button", { name: "−" }));
    fireEvent.click(screen.getByRole("button", { name: "Przejdź do zadania 2" }));
    expect(screen.getByText("Zadanie 1/2 · Wybierz działanie")).toBeInTheDocument();
    expect(screen.getByText("Zadanie 2/2 · Pokaż kolejne kroki")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "6" }));
    expect(screen.getByLabelText("Licznik pierwszego ułamka po rozszerzeniu")).toHaveValue("");
    expect(screen.getAllByLabelText("Kalkulator do kosza z jabłkami")).toHaveLength(1);
  });

  it("prowadzi samodzielne ćwiczenie jednym kalkulatorem przez kolejne kroki", () => {
    const { container } = render(<FractionDifferentDenominatorAdvancedLessonModel activity="different-denom-l2-independent" seed={536201} difficulty="challenge" />);
    const commonGroup = screen.getByRole("group", { name: "Wspólny mianownik do samodzielnego ćwiczenia" });
    fireEvent.click(within(commonGroup).getByRole("button", { name: "12" }));
    const keypad = screen.getByLabelText("Kalkulator do samodzielnych ćwiczeń");
    const activeEntry = container.querySelector("[data-independent-fraction-entry]");
    const entryInputs = activeEntry?.querySelectorAll("input") ?? [];
    expect(screen.getAllByLabelText("Kalkulator do samodzielnych ćwiczeń")).toHaveLength(1);
    expect(container.querySelectorAll("[data-independent-fraction-entry]")).toHaveLength(4);
    expect(entryInputs.length).toBeGreaterThanOrEqual(2);
    expect(entryInputs[0]).toHaveAttribute("inputmode", "none");
    expect(entryInputs[0]).toHaveAttribute("readonly");
    expect(screen.getByLabelText("Krok 1: część całkowita, cyfra 1 z 1")).toBe(entryInputs[0]);
    fireEvent.click(within(keypad).getByRole("button", { name: "1" }));
    expect(entryInputs[0]).toHaveValue("1");
    expect(screen.getByText("Zapis rozwiązania krok po kroku")).toBeInTheDocument();
  });

  it("pokazuje pożyczkę jako osobny krok i zawija długi zapis tylko między grupami", () => {
    const onResultChange = vi.fn();
    const { container } = render(<FractionDifferentDenominatorAdvancedLessonModel activity="different-denom-l2-independent" seed={536202} difficulty="challenge" onResultChange={onResultChange} />);
    const commonGroup = screen.getByRole("group", { name: "Wspólny mianownik do samodzielnego ćwiczenia" });
    fireEvent.click(within(commonGroup).getByRole("button", { name: "12" }));
    expect(container.querySelector("[data-equation-group='borrowing']")).toBeInTheDocument();
    expect(container.querySelector("[data-equation-group='common']")).toHaveClass("max-w-full", "overflow-x-auto");
    expect(container.querySelector("[data-independent-equation-chain]")).toHaveClass("flex-wrap", "max-w-full");
    expect(screen.getByLabelText("Krok 1: część całkowita, cyfra 1 z 1")).toHaveValue("");
    const enterStep = (digits: string[]) => {
      const keypad = screen.getByLabelText("Kalkulator do samodzielnych ćwiczeń");
      for (const digit of digits) fireEvent.click(within(keypad).getByRole("button", { name: digit }));
      fireEvent.click(within(keypad).getByRole("button", { name: "Zatwierdź" }));
    };
    enterStep(["3", "3", "1", "2"]);
    enterStep(["1", "1", "0", "1", "2"]);
    expect(screen.getByText("Pożycz jedną całość i zapisz pierwszą liczbę ponownie")).toBeInTheDocument();
    enterStep(["2", "1", "5", "1", "2"]);
    enterStep(["1", "5", "1", "2"]);
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź całe rozwiązanie" }));
    expect(onResultChange).toHaveBeenLastCalledWith(true, "3 1/4 − 1 5/6 = 1 5/12");
  });

  it("zachowuje części całkowite przez wszystkie kroki liczby mieszanej", () => {
    const onResultChange = vi.fn();
    render(<FractionDifferentDenominatorAdvancedLessonModel activity="different-denom-l2-independent" seed={536201} difficulty="challenge" onResultChange={onResultChange} />);
    fireEvent.click(within(screen.getByRole("group", { name: "Wspólny mianownik do samodzielnego ćwiczenia" })).getByRole("button", { name: "6" }));
    const enterStep = (digits: string[]) => {
      const keypad = screen.getByLabelText("Kalkulator do samodzielnych ćwiczeń");
      for (const digit of digits) fireEvent.click(within(keypad).getByRole("button", { name: digit }));
      fireEvent.click(within(keypad).getByRole("button", { name: "Zatwierdź" }));
    };
    const firstKeypad = screen.getByLabelText("Kalkulator do samodzielnych ćwiczeń");
    for (const digit of ["1", "3", "6"]) fireEvent.click(within(firstKeypad).getByRole("button", { name: digit }));
    expect(screen.getByLabelText("Krok 1: część całkowita, cyfra 1 z 1")).toHaveValue("1");
    expect(screen.getByLabelText("Krok 1: licznik, cyfra 1 z 1")).toHaveValue("3");
    expect(screen.getByLabelText("Krok 1: mianownik, cyfra 1 z 1")).toHaveValue("6");
    fireEvent.click(within(firstKeypad).getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByText("Wpisz drugą liczbę ze wspólnym mianownikiem")).toBeInTheDocument();
    enterStep(["4", "6"]);
    enterStep(["1", "7", "6"]);
    enterStep(["2", "1", "6"]);
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź całe rozwiązanie" }));
    expect(onResultChange).toHaveBeenLastCalledWith(true, "1 1/2 + 2/3 = 2 1/6");
  });
});
