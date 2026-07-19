/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DecimalNotationL1Lab } from "@/components/lessons/decimals/DecimalNotationL1Lab";

afterEach(cleanup);

function press(name: string | RegExp) {
  fireEvent.click(screen.getByRole("button", { name }));
}

describe("DecimalAddSubL1Lab", () => {
  it("liczy w pamięci według miejsc i używa wyłącznie klawiatury ekranowej", () => {
    const onResultChange = vi.fn();
    const { container } = render(<DecimalNotationL1Lab activity="mental-add-sub" seed={554304} onResultChange={onResultChange} />);
    const input = screen.getByLabelText("Wynik działania pamięciowego");
    expect(input).toHaveAttribute("readonly");
    expect(input).toHaveAttribute("inputmode", "none");
    expect(screen.getAllByText(/jedności:/u).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/części dziesiąte:/u).length).toBeGreaterThan(0);
    const keypad = container.querySelector<HTMLElement>("[data-lesson-numeric-keypad]")!;
    fireEvent.click(within(keypad).getByRole("button", { name: "4" }));
    fireEvent.click(within(keypad).getByRole("button", { name: ", przecinek" }));
    fireEvent.click(within(keypad).getByRole("button", { name: "6" }));
    fireEvent.click(within(keypad).getAllByRole("button").at(-1)!);
    expect(onResultChange).toHaveBeenLastCalledWith(true, "3,4 + 1,2 = 4,6");
  });

  it("pokazuje zapis pisemny z przecinkiem pod przecinkiem i nie otwiera klawiatury urządzenia", () => {
    const onResultChange = vi.fn();
    const { container } = render(<DecimalNotationL1Lab activity="written-add-sub" seed={554400} onResultChange={onResultChange} />);
    expect(within(screen.getByLabelText("Przykład dodawania pisemnego 2,45 i 1,37")).getAllByText(",")).toHaveLength(3);
    expect(screen.queryByText(/Zachowany tok pracy:/u)).not.toBeInTheDocument();
    const inputs = [...container.querySelectorAll<HTMLInputElement>('input[aria-label^="Wynik"]')];
    expect(inputs.length).toBeGreaterThan(0);
    inputs.forEach((input) => {
      expect(input).toHaveAttribute("readonly");
      expect(input).toHaveAttribute("inputmode", "none");
    });
    press(/^2$/u);
    press("Przejdź do kolumny po lewej");
    press(/^8$/u);
    press("Przejdź do kolumny po lewej");
    press(/^3$/u);
    press("Zatwierdź zapis");
    expect(onResultChange).toHaveBeenLastCalledWith(true, "2,45 + 1,37 = 3,82");
  });

  it("w zadaniu tekstowym wymaga wyboru działania przed obliczeniem", () => {
    render(<DecimalNotationL1Lab activity="story-add-sub" seed={554500} />);
    expect(screen.getByText(/W dzbanku było 1,25 l soku/u)).toBeInTheDocument();
    const answer = screen.getByLabelText("Odpowiedź do zadania tekstowego");
    expect(answer).toHaveValue("");
    expect(answer).toHaveAttribute("readonly");
    expect(answer).toHaveAttribute("inputmode", "none");
    expect(screen.queryByText("Zachowany tok pracy:")).not.toBeInTheDocument();
    press("+ dodawanie");
    expect(screen.getByText(/Zachowany tok pracy:/u)).toBeInTheDocument();
    expect(answer).toHaveValue("");
  });

  it("pokazuje pionową prowadnicę dla 2,45 i 1,3 oraz opcjonalne zero", () => {
    const { container } = render(<DecimalNotationL1Lab activity="comma-columns" seed={554101} />);
    expect(container.querySelectorAll("[data-comma-guide]")).toHaveLength(3);
    expect(screen.getByText(/Kolumna setnych w 1,3 jest pusta/u)).toBeInTheDocument();
    press("Dopisz opcjonalne zero: 1,3 → 1,30");
    expect(container.querySelector('[data-auxiliary-zero="true"]')).toHaveTextContent("1,30 = 1,3");
  });

  it("prowadzi dotykiem od setnych przez wymianę do poprawnej sumy", () => {
    const { container } = render(<DecimalNotationL1Lab activity="column-addition" seed={554102} />);
    expect(container.querySelector('[data-exchange="carry"]')).toBeInTheDocument();
    expect(screen.getByText(/10 setnych wymień na 1 dziesiątą/u)).toBeInTheDocument();
    press(/^2$/u);
    press("Przejdź do kolumny po lewej");
    press(/^8$/u);
    press("Przejdź do kolumny po lewej");
    press(/^3$/u);
    press("Sprawdź zapis pisemny");
    expect(screen.getByRole("status")).toHaveTextContent("Dodawanie jest poprawne");
    expect(screen.getByText(/Zachowany tok pracy:/u)).toHaveTextContent("3,82");
  });

  it("realizuje podstawowe odejmowanie bez śladu pożyczania", () => {
    const { container } = render(<DecimalNotationL1Lab activity="basic-subtraction" seed={554103} />);
    expect(container.querySelector('[data-exchange="borrow"]')).toBeNull();
    expect(screen.getByText(/nie trzeba wymieniać ani pożyczać/u)).toBeInTheDocument();
    press(/^2$/u);
    press("Przejdź do kolumny po lewej");
    press(/^5$/u);
    press("Przejdź do kolumny po lewej");
    press(/^3$/u);
    press("Sprawdź zapis pisemny");
    expect(screen.getByRole("status")).toHaveTextContent("nie wymagało pożyczania");
  });

  it("diagnozuje wyłącznie przecinek i nie usuwa poprawnych cyfr", () => {
    const { container } = render(<DecimalNotationL1Lab activity="repair-shifted-comma" seed={554104} />);
    expect(container.querySelectorAll("[data-preserved-digit]")).toHaveLength(3);
    press("Sprawdź pozycję przecinka");
    expect(screen.getByText("Kody diagnostyczne: DEC_COMMA_MISALIGNED")).toBeInTheDocument();
    expect(container.querySelectorAll("[data-preserved-digit]")).toHaveLength(3);
    press("Ustaw zapis 3,82");
    press("Sprawdź pozycję przecinka");
    expect(screen.getByRole("status")).toHaveTextContent("poprawne cyfry 3, 8 i 2 pozostały");
  });

  it("oddaje samodzielny wariant support przez lokalny adapter live", () => {
    const onResultChange = vi.fn();
    const { container } = render(<DecimalNotationL1Lab activity="independent-add-sub" seed={554105} taskSeed={554102} difficulty="support" onResultChange={onResultChange} />);
    expect(container.querySelector("[data-decimal-add-sub-l1]")).toHaveAttribute("data-answer-spec", "server-only");
    press("Wynik jest między 5 a 7");
    press(/^9$/u);
    press("Przejdź do kolumny po lewej");
    press(/^5$/u);
    press("Sprawdź zapis pisemny");
    expect(onResultChange).toHaveBeenLastCalledWith(true, "3,4 + 2,5 = 5,9");
  });
});
