/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DecimalNotationL1Lab } from "@/components/lessons/decimals/DecimalNotationL1Lab";

afterEach(cleanup);

function click(name: string | RegExp) {
  fireEvent.click(screen.getByRole("button", { name }));
}

function write(label: string | RegExp, value: string) {
  fireEvent.change(screen.getByRole("textbox", { name: label }), { target: { value } });
}

describe("DecimalAddSubL2Lab przez lokalny adapter", () => {
  it("pokazuje przekreślone stare cyfry i małe kratki nowych wartości", () => {
    const { container } = render(<DecimalNotationL1Lab activity="borrowing-subtraction" seed={554201} />);
    expect(container.querySelector("[data-decimal-add-sub-l2]")).toHaveAttribute("data-answer-spec", "server-only");
    expect(container.querySelectorAll("[data-crossed-old-digit]")).toHaveLength(4);
    expect(container.querySelector('[data-borrow-new-value="12"]')).toBeInTheDocument();
    expect(container.querySelector('[data-borrow-new-value="13"]')).toBeInTheDocument();
    click("odejmowanie z pożyczaniem: wpisz 4");
    click("odejmowanie z pożyczaniem: kolumna po lewej");
    click("odejmowanie z pożyczaniem: wpisz 6");
    click("odejmowanie z pożyczaniem: kolumna po lewej");
    click("odejmowanie z pożyczaniem: wpisz 4");
    click("Sprawdź rozwiązanie");
    expect(screen.getByRole("status")).toHaveTextContent("oba pożyczania");
  });

  it("utrzymuje metodę pisemną i dopełnianie w osobnych ramkach", () => {
    const { container } = render(<DecimalNotationL1Lab activity="change-two-methods" seed={554202} />);
    expect(container.querySelectorAll('[data-method="written"], [data-method="complement"]')).toHaveLength(2);
    write("Wynik, części setne", "5");
    write("Wynik, części dziesiąte", "6");
    write("Wynik, jedności", "3");
    click("6,35 → 7,00: +0,65 zł");
    click("7,00 → 10,00: +3,00 zł");
    write("Wynik dopełniania, części setne", "5");
    write("Wynik dopełniania, części dziesiąte", "6");
    write("Wynik dopełniania, jedności", "3");
    click("Sprawdź oba osobne zapisy");
    expect(screen.getByRole("status")).toHaveTextContent("Obie metody");
  });

  it("blokuje dokładny paragon do czasu szacunku i odrzuca półkę B7", () => {
    const { container } = render(<DecimalNotationL1Lab activity="workshop-receipt" seed={554203} />);
    expect(screen.getByText("PARAGON PRACOWNI")).toBeInTheDocument();
    expect(screen.getByText(/Najpierw wybierz oszacowanie/u)).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Suma paragonu, części setne" })).toHaveAttribute("readonly");
    click("Wynik jest między 8 a 10");
    click("Numer półki: B7");
    write("Suma paragonu, jedności", "8");
    write("Suma paragonu, części dziesiąte", "6");
    write("Suma paragonu, części setne", "0");
    click("Sprawdź rozwiązanie");
    expect(screen.getByRole("status")).toHaveTextContent("dokładna suma paragonu");
    expect(within(container.querySelector("[data-workshop-receipt]")!).getByText(/8,60 zł/u)).toBeInTheDocument();
  });

  it("diagnozuje tylko przecinek i zachowuje cyfry trudniejszego kontekstu", () => {
    const { container } = render(<DecimalNotationL1Lab activity="repair-context-comma" seed={554204} />);
    expect(container.querySelectorAll("[data-preserved-digit]")).toHaveLength(3);
    click("Sprawdź tylko przecinek");
    expect(screen.getByText("Kody diagnostyczne: DEC_COMMA_MISALIGNED")).toBeInTheDocument();
    expect(container.querySelectorAll("[data-preserved-digit]")).toHaveLength(3);
    click("Ustaw 6,25 zł");
    click("Sprawdź tylko przecinek");
    expect(screen.getByRole("status")).toHaveTextContent("cyfry 6, 2 i 5");
  });

  it("oddaje samodzielny support z feedbackiem konkretnej kolumny i zachowanym tokiem", () => {
    const onResultChange = vi.fn();
    render(<DecimalNotationL1Lab activity="independent-add-sub-l2" seed={554205} taskSeed={554202} difficulty="support" onResultChange={onResultChange} />);
    click("Wynik jest między 5 a 7");
    write("Wynik, części dziesiąte", "8");
    write("Wynik, jedności", "5");
    click("Sprawdź rozwiązanie");
    expect(screen.getByRole("alert")).toHaveTextContent("części dziesiąte");
    expect(screen.getByText(/Zachowany tok samodzielna próba/u)).toHaveTextContent("5,8");
    write("Wynik, części dziesiąte", "7");
    click("Sprawdź rozwiązanie");
    expect(onResultChange).toHaveBeenLastCalledWith(true, "8,4 − 2,7 = 5,7 m");
  });
});
