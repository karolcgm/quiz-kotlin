/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FractionDifferentDenominatorAdvancedLessonModel } from "@/components/lessons/fractions/FractionDifferentDenominatorAdvancedLessonModel";

afterEach(cleanup);

function fillFraction(numerator: string, denominator: string, whole?: string) {
  if (whole) fireEvent.change(screen.getByLabelText("część całkowita, cyfra 1 z 1"), { target: { value: whole } });
  fireEvent.change(screen.getByLabelText(`licznik, cyfra 1 z ${numerator.length}`), { target: { value: numerator[0] } });
  for (let index = 1; index < numerator.length; index += 1) {
    fireEvent.change(screen.getByLabelText(`licznik, cyfra ${index + 1} z ${numerator.length}`), { target: { value: numerator[index] } });
  }
  fireEvent.change(screen.getByLabelText(`mianownik, cyfra 1 z ${denominator.length}`), { target: { value: denominator[0] } });
  for (let index = 1; index < denominator.length; index += 1) {
    fireEvent.change(screen.getByLabelText(`mianownik, cyfra ${index + 1} z ${denominator.length}`), { target: { value: denominator[index] } });
  }
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
    fillFraction("7", "12");
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź rozwiązanie L2" }));
    expect(onResultChange).toHaveBeenLastCalledWith(true, "5/6 − 1/4 = 7/12");
  });

  it("łączy obliczenie mikstury z oceną, że wynik przekracza litr", () => {
    const { container } = render(<FractionDifferentDenominatorAdvancedLessonModel activity="different-denom-l2-greenhouse" seed={3} />);
    fireEvent.click(screen.getByRole("button", { name: "więcej niż 1 l" }));
    chooseCommon("12");
    fillFraction("5", "12", "1");
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź rozwiązanie L2" }));
    expect(screen.getByText(/Poprawnie: wybrano wspólną miarę 12/)).toBeInTheDocument();
    expect(container.querySelector("[data-greenhouse-mixture] [data-member-id='greenhouse-level']")).toBeInTheDocument();
  });

  it("przekreśla 3/7 po wskazaniu dodawania mianowników i pozwala naprawić wynik", () => {
    const { container } = render(<FractionDifferentDenominatorAdvancedLessonModel activity="different-denom-l2-repair" seed={4} />);
    fireEvent.click(screen.getByRole("button", { name: "Dodano mianowniki: 3 + 4 = 7" }));
    expect(container.querySelector("[data-member-id='repair-wrong-denominator']")).toHaveClass("line-through");
    expect(container.querySelector("[data-smart-different-denominator-operation]")).not.toBeInTheDocument();
    const commonKeypad = screen.getByLabelText("Klawiatura wspólnego mianownika");
    fireEvent.click(within(commonKeypad).getByRole("button", { name: "1" }));
    fireEvent.click(within(commonKeypad).getByRole("button", { name: "2" }));
    fillFraction("11", "12");
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź rozwiązanie L2" }));
    expect(screen.getByText(/Poprawnie: wybrano wspólną miarę 12/)).toBeInTheDocument();
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
    expect(entryInputs.length).toBeGreaterThanOrEqual(2);
    expect(entryInputs[0]).toHaveAttribute("inputmode", "none");
    expect(entryInputs[0]).toHaveAttribute("readonly");
    fireEvent.click(within(keypad).getByRole("button", { name: "9" }));
    expect(entryInputs[0]).toHaveValue("9");
    expect(screen.getByText("2. Zapis rozwiązania")).toBeInTheDocument();
  });
});
