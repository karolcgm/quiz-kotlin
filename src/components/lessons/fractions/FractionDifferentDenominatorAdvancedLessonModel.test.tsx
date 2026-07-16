/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FractionDifferentDenominatorAdvancedLessonModel } from "@/components/lessons/fractions/FractionDifferentDenominatorAdvancedLessonModel";

afterEach(cleanup);

function fillFraction(numerator: string, denominator: string, whole?: string) {
  if (whole) fireEvent.change(screen.getByLabelText("część całkowita, cyfra 1 z 1"), { target: { value: whole } });
  fireEvent.change(screen.getByLabelText("licznik, cyfra 1 z 1"), { target: { value: numerator } });
  fireEvent.change(screen.getByLabelText("mianownik, cyfra 1 z 1"), { target: { value: denominator[0] } });
  for (let index = 1; index < denominator.length; index += 1) {
    fireEvent.change(screen.getByLabelText(`mianownik, cyfra ${index + 1} z ${index + 1}`), { target: { value: denominator[index] } });
  }
}

function chooseCommon(value: string) {
  fireEvent.click(within(screen.getByRole("group", { name: "Wspólny mianownik L2" })).getByRole("button", { name: value }));
}

describe("FractionDifferentDenominatorAdvancedLessonModel", () => {
  it("pokazuje na równych paskach wspólną miarę i wynik dodawania", () => {
    const { container } = render(<FractionDifferentDenominatorAdvancedLessonModel activity="different-denom-l2-subtraction-bars" seed={1} />);
    fillFraction("5", "6");
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź rozwiązanie L2" }));
    expect(screen.getByText(/Poprawnie: wybrano wspólną miarę 6/)).toBeInTheDocument();
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
    fillFraction("1", "12");
    fireEvent.change(screen.getByLabelText("licznik, cyfra 2 z 2"), { target: { value: "1" } });
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź rozwiązanie L2" }));
    expect(screen.getByText(/Poprawnie: wybrano wspólną miarę 12/)).toBeInTheDocument();
  });
});
