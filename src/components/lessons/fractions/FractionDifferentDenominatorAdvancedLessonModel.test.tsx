/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FractionDifferentDenominatorAdvancedLessonModel } from "@/components/lessons/fractions/FractionDifferentDenominatorAdvancedLessonModel";

afterEach(cleanup);

function enterKeypadDigits(label: string, digits: string[]) {
  const keypad = screen.getByLabelText(label);
  for (const digit of digits) fireEvent.click(within(keypad).getByRole("button", { name: digit }));
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
    enterKeypadDigits("Kalkulator do mikstury w szklarni", ["8", "1", "2", "9", "1", "2", "1", "7", "1", "2", "1", "5", "1", "2"]);
    fireEvent.click(within(screen.getByLabelText("Kalkulator do mikstury w szklarni")).getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByText(/Poprawnie: wybrano wspólną miarę 12/)).toBeInTheDocument();
    expect(container.querySelector("[data-greenhouse-mixture] [data-member-id='greenhouse-level']")).toBeInTheDocument();
    expect(container.querySelectorAll("[data-stepwise-fraction-workspace]")).toHaveLength(1);
  });

  it("przekreśla 3/7 po wskazaniu dodawania mianowników i pozwala naprawić wynik", () => {
    const { container } = render(<FractionDifferentDenominatorAdvancedLessonModel activity="different-denom-l2-repair" seed={4} />);
    fireEvent.click(screen.getByRole("button", { name: "Dodano mianowniki: 3 + 4 = 7" }));
    expect(container.querySelector("[data-member-id='repair-wrong-denominator']")).toHaveClass("line-through");
    expect(container.querySelector("[data-smart-different-denominator-operation]")).not.toBeInTheDocument();
    expect(container.querySelectorAll("[data-stepwise-fraction-workspace]")).toHaveLength(1);
    expect(container.querySelectorAll("[data-lesson-numeric-keypad='shared']")).toHaveLength(1);
    expect(screen.getByText("Najpierw wpisz wspólny mianownik")).toBeInTheDocument();
    expect(screen.getByLabelText("Krok 1: licznik, cyfra 1 z 1")).toBeDisabled();
    const commonKeypad = screen.getByLabelText("Kalkulator do naprawy rozwiązania");
    fireEvent.click(within(commonKeypad).getByRole("button", { name: "1" }));
    fireEvent.click(within(commonKeypad).getByRole("button", { name: "2" }));
    expect(container.querySelectorAll("[data-lesson-numeric-keypad='shared']")).toHaveLength(1);
    expect(screen.getByLabelText("Krok 1: licznik, cyfra 1 z 1")).not.toBeDisabled();
    enterKeypadDigits("Kalkulator do naprawy rozwiązania", ["8", "1", "2", "3", "1", "2", "1", "1", "1", "2"]);
    fireEvent.click(within(screen.getByLabelText("Kalkulator do naprawy rozwiązania")).getByRole("button", { name: "Zatwierdź" }));
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

  it("prowadzi dodawanie i odejmowanie jednym kalkulatorem przez wszystkie kroki", () => {
    const { container } = render(<FractionDifferentDenominatorAdvancedLessonModel activity="different-denom-l2-independent" seed={536191} difficulty="challenge" />);
    const commonGroup = screen.getByRole("group", { name: "Wspólny mianownik działania" });
    fireEvent.click(within(commonGroup).getByRole("button", { name: "12" }));
    const keypad = screen.getByLabelText("Kalkulator do dodawania i odejmowania ułamków");
    const activeEntry = container.querySelector("[data-independent-fraction-entry]");
    const entryInputs = activeEntry?.querySelectorAll("input") ?? [];
    expect(screen.getAllByLabelText("Kalkulator do dodawania i odejmowania ułamków")).toHaveLength(1);
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
    const { container } = render(<FractionDifferentDenominatorAdvancedLessonModel activity="different-denom-l2-independent" seed={536192} difficulty="challenge" onResultChange={onResultChange} />);
    const commonGroup = screen.getByRole("group", { name: "Wspólny mianownik działania" });
    fireEvent.click(within(commonGroup).getByRole("button", { name: "12" }));
    expect(container.querySelector("[data-equation-group='borrowing']")).toBeInTheDocument();
    expect(container.querySelector("[data-equation-group='common']")).toHaveClass("max-w-full", "overflow-x-auto");
    expect(container.querySelector("[data-independent-equation-chain]")).toHaveClass("flex-wrap", "max-w-full");
    expect(screen.getByLabelText("Krok 1: część całkowita, cyfra 1 z 1")).toHaveValue("");
    const enterStep = (digits: string[]) => {
      const keypad = screen.getByLabelText("Kalkulator do dodawania i odejmowania ułamków");
      for (const digit of digits) fireEvent.click(within(keypad).getByRole("button", { name: digit }));
    };
    enterStep(["3", "3", "1", "2"]);
    enterStep(["1", "1", "0", "1", "2"]);
    enterStep(["2", "1", "5", "1", "2"]);
    enterStep(["1", "5", "1", "2"]);
    fireEvent.click(within(screen.getByLabelText("Kalkulator do dodawania i odejmowania ułamków")).getByRole("button", { name: "Zatwierdź" }));
    expect(onResultChange).toHaveBeenLastCalledWith(true, "3 1/4 − 1 5/6 = 1 5/12");
  });

  it("po pożyczce zachowuje osobne kratki na wynik działania i wynik po skróceniu", () => {
    const onResultChange = vi.fn();
    const { container } = render(<FractionDifferentDenominatorAdvancedLessonModel activity="different-denom-l2-independent" seed={536203} difficulty="challenge" onResultChange={onResultChange} />);
    fireEvent.click(within(screen.getByRole("group", { name: "Wspólny mianownik działania" })).getByRole("button", { name: "30" }));

    expect(container.querySelectorAll("[data-independent-fraction-entry]")).toHaveLength(5);
    expect(container.querySelector("[data-equation-group='calculation']")).toBeInTheDocument();
    expect(container.querySelector("[data-equation-group='simplified-final']")).toHaveTextContent("po skróceniu");

    const keypad = screen.getByLabelText("Kalkulator do dodawania i odejmowania ułamków");
    for (const digit of [
      "7", "4", "3", "0",
      "3", "9", "3", "0",
      "6", "3", "4", "3", "0",
      "3", "2", "5", "3", "0",
      "3", "5", "6",
    ]) {
      fireEvent.click(within(keypad).getByRole("button", { name: digit }));
    }
    fireEvent.click(within(keypad).getByRole("button", { name: "Zatwierdź" }));

    expect(onResultChange).toHaveBeenLastCalledWith(true, "7 2/15 − 3 3/10 = 3 5/6");
  });

  it("zatwierdza jednym kliknięciem poprawne rozwiązanie 6 3/4 − 2 5/6", () => {
    const onResultChange = vi.fn();
    render(<FractionDifferentDenominatorAdvancedLessonModel activity="different-denom-l2-independent" seed={536201} difficulty="challenge" onResultChange={onResultChange} />);
    fireEvent.click(within(screen.getByRole("group", { name: "Wspólny mianownik działania" })).getByRole("button", { name: "12" }));
    const keypad = screen.getByLabelText("Kalkulator do dodawania i odejmowania ułamków");
    for (const digit of ["6", "9", "1", "2", "2", "1", "0", "1", "2", "5", "2", "1", "1", "2", "3", "1", "1", "1", "2"]) {
      fireEvent.click(within(keypad).getByRole("button", { name: digit }));
    }
    fireEvent.click(within(keypad).getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByText(/Poprawnie: wybrano wspólną miarę 12/)).toBeInTheDocument();
    expect(onResultChange).toHaveBeenLastCalledWith(true, "6 3/4 − 2 5/6 = 3 11/12");
  });

  it("zachowuje części całkowite przez wszystkie kroki liczby mieszanej", () => {
    const onResultChange = vi.fn();
    render(<FractionDifferentDenominatorAdvancedLessonModel activity="different-denom-l2-independent" seed={536191} difficulty="challenge" onResultChange={onResultChange} />);
    fireEvent.click(within(screen.getByRole("group", { name: "Wspólny mianownik działania" })).getByRole("button", { name: "6" }));
    const enterStep = (digits: string[]) => {
      const keypad = screen.getByLabelText("Kalkulator do dodawania i odejmowania ułamków");
      for (const digit of digits) fireEvent.click(within(keypad).getByRole("button", { name: digit }));
    };
    const firstKeypad = screen.getByLabelText("Kalkulator do dodawania i odejmowania ułamków");
    for (const digit of ["1", "3", "6"]) fireEvent.click(within(firstKeypad).getByRole("button", { name: digit }));
    expect(screen.getByLabelText("Krok 1: część całkowita, cyfra 1 z 1")).toHaveValue("1");
    expect(screen.getByLabelText("Krok 1: licznik, cyfra 1 z 1")).toHaveValue("3");
    expect(screen.getByLabelText("Krok 1: mianownik, cyfra 1 z 1")).toHaveValue("6");
    enterStep(["4", "6"]);
    enterStep(["1", "7", "6"]);
    enterStep(["2", "1", "6"]);
    fireEvent.click(within(firstKeypad).getByRole("button", { name: "Zatwierdź" }));
    expect(onResultChange).toHaveBeenLastCalledWith(true, "1 1/2 + 2/3 = 2 1/6");
  });

  it.each([
    { activity: "different-denom-l2-greenhouse" as const, seed: 3, setup: () => chooseCommon("12"), keypad: "Kalkulator do mikstury w szklarni", field: "Krok 2: licznik, cyfra 1 z 1", digit: "9" },
    { activity: "different-denom-l2-repair" as const, seed: 4, setup: () => { fireEvent.click(screen.getByRole("button", { name: "Dodano mianowniki: 3 + 4 = 7" })); const keypad = screen.getByLabelText("Kalkulator do naprawy rozwiązania"); fireEvent.click(within(keypad).getByRole("button", { name: "1" })); fireEvent.click(within(keypad).getByRole("button", { name: "2" })); }, keypad: "Kalkulator do naprawy rozwiązania", field: "Krok 2: licznik, cyfra 1 z 1", digit: "3" },
    { activity: "different-denom-l2-independent" as const, seed: 536201, setup: () => { const group = screen.getByRole("group", { name: "Wspólny mianownik działania" }); fireEvent.click(within(group).getByRole("button", { name: "12" })); }, keypad: "Kalkulator do dodawania i odejmowania ułamków", field: "Krok 2: mianownik, cyfra 2 z 2", digit: "2" },
  ])("w $activity kalkulator wpisuje do klikniętej kratki, a nie tylko do pierwszego kroku", ({ activity, seed, setup, keypad, field, digit }) => {
    render(<FractionDifferentDenominatorAdvancedLessonModel activity={activity} seed={seed} difficulty="challenge" />);
    setup();
    const input = screen.getByLabelText(field);
    fireEvent.click(input);
    fireEvent.click(within(screen.getByLabelText(keypad)).getByRole("button", { name: digit }));
    expect(input).toHaveValue(digit);
    expect(input).toHaveAttribute("inputmode", "none");
    expect(input).toHaveAttribute("readonly");
  });
});
