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
    expect(within(screen.getByLabelText("Przykład dodawania pisemnego 2,45 i 1,37")).getByText("2,45")).toBeInTheDocument();
    expect(within(screen.getByLabelText("Przykład dodawania pisemnego 2,45 i 1,37")).getByText("+ 1,37")).toBeInTheDocument();
    expect(screen.queryByText(/Zachowany tok pracy:/u)).not.toBeInTheDocument();
    const resultCells = [...container.querySelectorAll<HTMLButtonElement>('button[aria-label^="Wynik"]')];
    const carryCells = [...container.querySelectorAll<HTMLButtonElement>('button[aria-label^="Przeniesienie"]')];
    expect(resultCells.length).toBeGreaterThan(0);
    expect(carryCells.length).toBeGreaterThan(0);
    resultCells.forEach((cell) => expect(cell).toBeEmptyDOMElement());
    press(/^2$/u);
    press("Przejdź do kolumny po lewej");
    press(/^8$/u);
    press("Przejdź do kolumny po lewej");
    press(/^3$/u);
    press("Zatwierdź zapis");
    expect(onResultChange).toHaveBeenLastCalledWith(true, "2,45 + 1,37 = 3,82");
  });

  it("w zadaniu tekstowym wymaga wyboru działania przed obliczeniem", () => {
    const { container } = render(<DecimalNotationL1Lab activity="story-add-sub" seed={554500} />);
    expect(screen.getByText(/W dzbanku było 1,25 l soku/u)).toBeInTheDocument();
    expect(screen.getByLabelText("Ilustracja dzbanka z sokiem")).toBeInTheDocument();
    expect(screen.queryByText("Zachowany tok pracy:")).not.toBeInTheDocument();
    press("+ dodawanie");
    expect(screen.getByText("Samodzielnie zapisz działanie")).toBeInTheDocument();
    expect(container.querySelector("thead")).not.toBeInTheDocument();
    expect(container.querySelectorAll('button[aria-label^="Przeniesienie"]')).not.toHaveLength(0);
    const operandCells = [...container.querySelectorAll<HTMLButtonElement>('button[aria-label^="Pierwsza liczba"], button[aria-label^="Druga liczba"]')];
    expect(operandCells).toHaveLength(6);
    operandCells.forEach((cell) => expect(cell).toBeEmptyDOMElement());
    const answer = screen.getByLabelText("Odpowiedź do zadania tekstowego");
    expect(answer).toHaveValue("");
    expect(answer).toHaveAttribute("readonly");
    expect(answer).toHaveAttribute("inputmode", "none");
    expect(screen.queryByText(/Zachowany tok pracy:/u)).not.toBeInTheDocument();
    expect(answer).toHaveValue("");
    fireEvent.click(answer);
    expect(screen.getByText("Wpisujesz odpowiedź do zadania tekstowego.")).toBeInTheDocument();
    fireEvent.click(container.querySelector<HTMLButtonElement>('button[aria-label^="Wynik"]')!);
    expect(screen.queryByText("Wpisujesz odpowiedź do zadania tekstowego.")).not.toBeInTheDocument();
  });

  it("pozwala uczniowi samodzielnie przepisać obie liczby z treści", () => {
    const onResultChange = vi.fn();
    render(<DecimalNotationL1Lab activity="story-add-sub" seed={554500} onResultChange={onResultChange} />);
    press("+ dodawanie");

    const fill = (label: string, digit: string) => {
      fireEvent.click(screen.getByRole("button", { name: label }));
      press(new RegExp(`^${digit}$`, "u"));
    };
    fill("Pierwsza liczba, jedności", "1");
    fill("Pierwsza liczba, części dziesiąte", "2");
    fill("Pierwsza liczba, części setne", "5");
    fill("Druga liczba, jedności", "0");
    fill("Druga liczba, części dziesiąte", "7");
    fill("Druga liczba, części setne", "5");
    fill("Wynik, jedności", "2");
    fill("Wynik, części dziesiąte", "0");
    fill("Wynik, części setne", "0");

    fireEvent.click(screen.getByLabelText("Odpowiedź do zadania tekstowego"));
    press(/^2$/u);
    press("Zatwierdź zapis");
    expect(onResultChange).toHaveBeenLastCalledWith(true, "1,25 + 0,75 = 2");
  });

  it("po wpisaniu przeniesienia pozwala od razu wybrać kratkę wyniku", () => {
    const { container } = render(<DecimalNotationL1Lab activity="written-add-sub" seed={554400} />);
    const carry = container.querySelector<HTMLButtonElement>('button[aria-label^="Przeniesienie"]')!;
    const result = container.querySelector<HTMLButtonElement>('button[aria-label^="Wynik"]')!;
    fireEvent.click(carry);
    press(/^1$/u);
    fireEvent.click(result);
    press(/^2$/u);
    expect(result).toHaveTextContent("2");
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
  it("w trzecim zadaniu pokazuje zero uzupełniające zamiast pustej kratki", () => {
    render(<DecimalNotationL1Lab activity="written-add-sub" seed={554402} />);

    expect(screen.getByLabelText("comma-left, części setne: 0")).toHaveTextContent("0");
  });

  it("w siódmym zadaniu pokazuje 12,40 bez dodatkowej kratki przed 3,56", () => {
    const { container } = render(<DecimalNotationL1Lab activity="written-add-sub" seed={554406} />);

    expect(screen.getByLabelText("comma-left, części setne: 0")).toHaveTextContent("0");
    expect(container.querySelectorAll('[data-static-empty="true"]')).toHaveLength(1);
  });
});
