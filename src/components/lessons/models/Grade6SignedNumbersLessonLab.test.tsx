/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Grade6SignedNumbersLessonLab } from "@/components/lessons/models/Grade6SignedNumbersLessonLab";
import { GRADE6_SIGNED_NUMBERS_TASK_COUNTS } from "@/components/lessons/models/Grade6SignedNumbersV2Lab";
import { integerNumbersActivityFromStageId } from "@/components/lessons/models/IntegerNumbersLessonLab";
import { integerAddSubtractActivityFromStageId } from "@/components/lessons/models/IntegerAddSubtractLessonLab";
import { integerMulDivActivityFromStageId } from "@/components/lessons/models/IntegerMulDivLessonLab";
import { integerReviewActivityFromStageId } from "@/components/lessons/models/IntegerReviewLessonLab";

afterEach(cleanup);

describe("Grade6SignedNumbersLessonLab V2", () => {
  it("pokazuje jedno zadanie sterowane przez systemowy seed i tylko jeden licznik", () => {
    render(<Grade6SignedNumbersLessonLab activity="g6-integer-compare" taskSeed={671401} questionNumber={1} questionCount={8} readOnly />);
    expect(screen.getAllByText("Zadanie 1/8")).toHaveLength(1);
    expect(screen.queryByRole("navigation", { name: /Nawigacja między zadaniami/u })).not.toBeInTheDocument();
    expect(GRADE6_SIGNED_NUMBERS_TASK_COUNTS["g6-integer-compare"]).toBe(8);
  });

  it("rysuje pełną oś liczbową z jedną strzałką po prawej stronie", () => {
    const { container } = render(<Grade6SignedNumbersLessonLab activity="g6-integer-line" questionNumber={1} questionCount={4} readOnly />);
    const axisLine = container.querySelector("[data-number-axis-line]");
    const arrows = container.querySelectorAll("[data-number-axis-arrow]");
    expect(axisLine).toHaveAttribute("x1", "54");
    expect(axisLine).toHaveAttribute("x2", "832");
    expect(arrows).toHaveLength(1);
    expect(arrows[0]).toHaveAttribute("d", "M860 132 L828 111 L828 153 Z");
  });

  it("po uproszczeniu znaków uczeń wpisuje cały wynik w jednej kratce", () => {
    const onResultChange = vi.fn();
    render(<Grade6SignedNumbersLessonLab activity="g6-add-model" taskSeed={2} questionNumber={3} questionCount={8} onResultChange={onResultChange} />);
    const input = screen.getByLabelText("Wynik działania −4 + (−3)");
    expect(input).toHaveAttribute("inputmode", "none");
    expect(input).toHaveAttribute("readonly");
    fireEvent.click(screen.getByRole("button", { name: "− minus" }));
    fireEvent.click(screen.getByRole("button", { name: "7" }));
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getAllByRole("status").some((status) => status.textContent?.includes("Brawo!"))).toBe(true);
    expect(onResultChange).toHaveBeenLastCalledWith(true, "-7");
  });

  it("nie pozwala zatwierdzić pustego zapisu ułamkowego", () => {
    const onResultChange = vi.fn();
    render(<Grade6SignedNumbersLessonLab activity="g6-add-fractions" taskSeed={0} questionNumber={1} questionCount={6} onResultChange={onResultChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByRole("status")).toHaveTextContent("Uzupełnij wszystkie liczniki i mianowniki");
    expect(onResultChange).toHaveBeenLastCalledWith(null);
  });

  it("zapewnia ułamkom osobne pola obliczeń i pionowy zapis", () => {
    const { container } = render(<Grade6SignedNumbersLessonLab activity="g6-divide-fractions" taskSeed={0} questionNumber={1} questionCount={6} />);
    expect(screen.getByLabelText("Licznik odwrotności dzielnika")).toHaveAttribute("readonly");
    expect(screen.getByLabelText("Mianownik odwrotności dzielnika")).toHaveAttribute("inputmode", "none");
    expect(screen.getByLabelText("Licznik wyniku")).toBeInTheDocument();
    expect(screen.getByLabelText("Mianownik wyniku")).toBeInTheDocument();
    expect(container.querySelectorAll("[data-stacked-fraction]").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByRole("region", { name: "Klawiatura do miejsca na obliczenia" })).toBeInTheDocument();
  });

  it("po odpowiedzi bez punktu używa neutralnego komunikatu", () => {
    const onResultChange = vi.fn();
    render(<Grade6SignedNumbersLessonLab activity="g6-context-integers" taskSeed={0} questionNumber={1} questionCount={6} onResultChange={onResultChange} />);
    fireEvent.click(screen.getByRole("button", { name: "+4" }));
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź odpowiedź" }));
    expect(screen.getByRole("status")).toHaveTextContent("Spróbuj innym razem. Poprawny wynik to −4. Dziś bez punktu.");
    expect(screen.getByRole("status")).not.toHaveTextContent(/Źle|Błąd/u);
    expect(onResultChange).toHaveBeenLastCalledWith(false, "4");
  });

  it("pokazuje zbiory jako zagnieżdżone koła bez symbolu zawierania", () => {
    const { container } = render(<Grade6SignedNumbersLessonLab activity="g6-number-sets" taskSeed={0} questionNumber={1} questionCount={8} readOnly />);
    const rational = container.querySelector('[data-number-set="wymierne"]');
    const integers = rational?.querySelector('[data-number-set="całkowite"]');
    const naturals = integers?.querySelector('[data-number-set="naturalne"]');
    expect(rational).toBeInTheDocument();
    expect(integers).toBeInTheDocument();
    expect(naturals).toBeInTheDocument();
    expect(container).not.toHaveTextContent("⊂");
  });

  it("zmienia żetony razem z przykładem w jednej wspólnej serii dodawania i odejmowania", () => {
    const { container, rerender } = render(<Grade6SignedNumbersLessonLab activity="g6-add-model" taskSeed={672096} questionNumber={1} questionCount={8} />);
    expect(screen.getByRole("region", { name: "Działanie −6 + 1" })).toHaveTextContent("−6 + 1 =");
    expect(container.querySelectorAll("[data-token-equation]")).toHaveLength(1);
    expect(screen.getByLabelText("Wynik działania −6 + 1")).toHaveAttribute("inputmode", "none");
    expect(screen.getByLabelText("Wynik działania −6 + 1")).toHaveAttribute("readonly");
    expect(screen.queryByText(/Wynik odejmowania/u)).not.toBeInTheDocument();
    expect(screen.queryByText("Miejsce na obliczenia")).not.toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Klawiatura do wpisania wyniku" })).toBeInTheDocument();
    expect(screen.getAllByText("−1")).toHaveLength(6);
    expect(screen.getAllByText("+1")).toHaveLength(1);
    fireEvent.click(screen.getByRole("button", { name: "Usuń następną parę zerową" }));
    expect(screen.getByRole("status")).toHaveTextContent("wynik to −5");

    rerender(<Grade6SignedNumbersLessonLab activity="g6-add-model" taskSeed={672097} questionNumber={2} questionCount={8} />);
    expect(screen.getByRole("region", { name: "Działanie −3 + 5" })).toHaveTextContent("−3 + 5 =");
    expect(container.querySelectorAll("[data-token-equation]")).toHaveLength(1);
    expect(screen.getAllByText("−1")).toHaveLength(3);
    expect(screen.getAllByText("+1")).toHaveLength(5);
  });

  it("pokazuje ułamki jako pełny łańcuch po znaku równości i blokuje klawiaturę urządzenia", () => {
    const { container } = render(<Grade6SignedNumbersLessonLab activity="g6-add-fractions" taskSeed={2} questionNumber={3} questionCount={6} />);
    expect(screen.getByLabelText("Licznik: left")).toHaveAttribute("inputmode", "none");
    expect(screen.getByLabelText("Mianownik: result")).toHaveAttribute("readonly");
    expect(container.querySelectorAll("[data-stacked-fraction]").length).toBeGreaterThanOrEqual(2);
    expect(container.querySelectorAll("[data-fraction-equation-entry]")).toHaveLength(3);
    expect(container.querySelectorAll("[data-fraction-sign-choice]")).toHaveLength(2);
    expect(screen.getByRole("button", { name: "Znak działania po uproszczeniu: plus" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Znak działania po uproszczeniu: minus" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Znak wyniku końcowego: plus" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Znak wyniku końcowego: minus" })).toBeInTheDocument();
  });

  it("pozwala wybrać znak także przed wynikiem pośrednim ułamka", () => {
    const { container } = render(<Grade6SignedNumbersLessonLab activity="g6-add-fractions" taskSeed={1} questionNumber={2} questionCount={6} />);
    expect(container.querySelectorAll("[data-fraction-sign-choice]")).toHaveLength(3);
    expect(screen.getByRole("button", { name: "Znak wyniku pośredniego: plus" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Znak wyniku pośredniego: minus" })).toBeInTheDocument();
  });

  it("zapisuje działanie dziesiętne w jednej linii z wyborem znaków", () => {
    const onResultChange = vi.fn();
    const { container } = render(<Grade6SignedNumbersLessonLab activity="g6-add-decimals" taskSeed={1} questionNumber={2} questionCount={6} onResultChange={onResultChange} />);
    expect(screen.getByText("4,5 + (−7,1)")).toBeInTheDocument();
    expect(screen.getByLabelText("Pierwsza liczba po uproszczeniu")).toHaveAttribute("inputmode", "none");
    expect(screen.getByLabelText("Druga liczba po uproszczeniu")).toHaveAttribute("readonly");
    expect(screen.getByLabelText("Wynik działania dziesiętnego")).toHaveAttribute("readonly");
    expect(container.querySelectorAll("[data-decimal-equation-entry]")).toHaveLength(3);
    expect(container.querySelectorAll("[data-decimal-sign-choice]")).toHaveLength(2);
    expect(screen.getByRole("button", { name: "Znak działania po uproszczeniu: plus" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Znak działania po uproszczeniu: minus" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Znak wyniku końcowego: plus" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Znak wyniku końcowego: minus" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Klawiatura do zapisu liczb dziesiętnych" })).toBeInTheDocument();
    expect(GRADE6_SIGNED_NUMBERS_TASK_COUNTS["g6-add-decimals"]).toBe(6);

    fireEvent.click(screen.getByLabelText("Pierwsza liczba po uproszczeniu"));
    fireEvent.click(screen.getByRole("button", { name: "4" }));
    fireEvent.click(screen.getByRole("button", { name: /przecinek/u }));
    fireEvent.click(screen.getByRole("button", { name: "5" }));
    fireEvent.click(screen.getByLabelText("Druga liczba po uproszczeniu"));
    fireEvent.click(screen.getByRole("button", { name: "7" }));
    fireEvent.click(screen.getByRole("button", { name: /przecinek/u }));
    fireEvent.click(screen.getByRole("button", { name: "1" }));
    fireEvent.click(screen.getByLabelText("Wynik działania dziesiętnego"));
    fireEvent.click(screen.getByRole("button", { name: "2" }));
    fireEvent.click(screen.getByRole("button", { name: /przecinek/u }));
    fireEvent.click(screen.getByRole("button", { name: "6" }));
    fireEvent.click(screen.getByRole("button", { name: "Znak działania po uproszczeniu: minus" }));
    fireEvent.click(screen.getByRole("button", { name: "Znak wyniku końcowego: minus" }));
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByRole("status")).toHaveTextContent("Brawo!");
    expect(onResultChange).toHaveBeenLastCalledWith(true, expect.any(String));
  });

  it("w zadaniu tekstowym wymaga danych, całego działania i odpowiedzi", () => {
    render(<Grade6SignedNumbersLessonLab activity="g6-add-stories" taskSeed={0} questionNumber={1} questionCount={6} />);
    expect(screen.getByRole("region", { name: "Dane" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Działanie" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Odpowiedź" })).toBeInTheDocument();
    expect(screen.getByLabelText("Temperatura rano")).toHaveAttribute("inputmode", "none");
    expect(screen.getByLabelText("Wynik po znaku równości")).toHaveAttribute("readonly");
    expect(screen.getByRole("region", { name: "Klawiatura do pełnego rozwiązania" })).toBeInTheDocument();
  });

  it("zaczyna temat od reguł sąsiadujących znaków", () => {
    render(<Grade6SignedNumbersLessonLab activity="g6-sign-rules" taskSeed={0} questionNumber={1} questionCount={6} readOnly />);
    expect(screen.getByText("+ (−4) → −4")).toBeInTheDocument();
    expect(screen.getByText("− (−4) → +4")).toBeInTheDocument();
    expect(GRADE6_SIGNED_NUMBERS_TASK_COUNTS["g6-sign-rules"]).toBe(6);
  });

  it("pokazuje działania mnożenia bez opisów o spadkach i odwracaniu", () => {
    const { rerender } = render(<Grade6SignedNumbersLessonLab activity="g6-sign-discovery" taskSeed={0} questionNumber={1} questionCount={6} readOnly />);
    expect(screen.getByText("3 · (−2)")).toBeInTheDocument();
    expect(screen.queryByText(/spadek|odwrócenie/u)).not.toBeInTheDocument();

    rerender(<Grade6SignedNumbersLessonLab activity="g6-sign-discovery" taskSeed={1} questionNumber={2} questionCount={6} readOnly />);
    expect(screen.getByText("(−3) · (−2)")).toBeInTheDocument();
    expect(screen.queryByText(/spadek|odwrócenie/u)).not.toBeInTheDocument();
  });

  it("w mnożeniu liczb całkowitych pozwala wybrać tylko znak wyniku", () => {
    render(<Grade6SignedNumbersLessonLab activity="g6-multiply-integers" taskSeed={0} questionNumber={1} questionCount={8} />);
    expect(screen.getByText("−3 · 4 = □12")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "+" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "−" })).toBeInTheDocument();
    expect(screen.queryByLabelText(/Iloczyn wartości bezwzględnych/u)).not.toBeInTheDocument();
    expect(screen.queryByRole("region", { name: /Klawiatura/u })).not.toBeInTheDocument();
  });

  it("wspólny slajd liczb całkowitych zawiera trudniejsze iloczyny trzech i czterech liczb", () => {
    const { rerender } = render(<Grade6SignedNumbersLessonLab activity="g6-integer-mul-div" taskSeed={8} questionNumber={9} questionCount={12} />);
    expect(screen.getByText("(−2) · 3 · (−4) = □24")).toBeInTheDocument();
    rerender(<Grade6SignedNumbersLessonLab activity="g6-integer-mul-div" taskSeed={10} questionNumber={11} questionCount={12} />);
    expect(screen.getByText("(−2) · 3 · (−4) · (−5) = □120")).toBeInTheDocument();
    expect(screen.queryByRole("region", { name: /Klawiatura/u })).not.toBeInTheDocument();
  });

  it("łączy mnożenie i dzielenie ułamków zwykłych w jednym slajdzie z pełnym rachunkiem", () => {
    const { container, rerender } = render(<Grade6SignedNumbersLessonLab activity="g6-fraction-mul-div" taskSeed={0} questionNumber={1} questionCount={8} />);
    const workspace = screen.getByRole("region", { name: "Miejsce na obliczenia ułamków" });
    expect(workspace).toBeInTheDocument();
    expect(screen.getByLabelText("Licznik: reduced-left")).toHaveAttribute("inputmode", "none");
    expect(screen.getByLabelText("Mianownik: reduced-right")).toHaveAttribute("readonly");
    expect(screen.getByLabelText("Licznik: result")).toBeInTheDocument();
    expect(container.querySelectorAll("[data-fraction-equation-entry]")).toHaveLength(3);
    expect(screen.getByRole("region", { name: "Klawiatura do działań na ułamkach zwykłych" })).toBeInTheDocument();
    expect(workspace).not.toHaveTextContent(/\d+\/\d+/u);

    rerender(<Grade6SignedNumbersLessonLab activity="g6-fraction-mul-div" taskSeed={4} questionNumber={5} questionCount={8} />);
    expect(screen.getByText("Dzielenie")).toBeInTheDocument();
    expect(screen.getByLabelText("Pełny zapis mnożenia lub dzielenia ułamków ze znakiem")).toBeInTheDocument();
  });

  it("daje miejsce na pisemne mnożenie i przekształcenie dzielenia ułamków dziesiętnych", () => {
    const { rerender } = render(<Grade6SignedNumbersLessonLab activity="g6-decimal-mul-div" taskSeed={0} questionNumber={1} questionCount={8} />);
    expect(screen.getByRole("region", { name: "Miejsce na obliczenia ułamków dziesiętnych" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Mnożenie pisemne bez przecinków" })).toBeInTheDocument();
    expect(screen.getByLabelText("Pierwszy czynnik bez przecinka")).toHaveAttribute("inputmode", "none");
    expect(screen.getByLabelText("Pierwszy czynnik bez przecinka")).toHaveAttribute("readonly");
    expect(screen.getByRole("region", { name: "Klawiatura do działań na ułamkach dziesiętnych" })).toBeInTheDocument();

    rerender(<Grade6SignedNumbersLessonLab activity="g6-decimal-mul-div" taskSeed={4} questionNumber={5} questionCount={8} />);
    expect(screen.getByRole("region", { name: "Dzielenie po przesunięciu przecinków" })).toBeInTheDocument();
    expect(screen.getByLabelText("Dzielna po przesunięciu przecinka")).toHaveAttribute("readonly");
  });

  it("mapuje nowe etapy czterech tematów na właściwe aktywności", () => {
    expect(integerNumbersActivityFromStageId("m6-7-1-context-integers")).toBe("g6-context-integers");
    expect(integerNumbersActivityFromStageId("m6-7-1-rational-compare")).toBe("g6-rational-compare");
    expect(integerNumbersActivityFromStageId("m6-7-1-absolute-opposites")).toBe("g6-absolute-opposites");
    expect(integerAddSubtractActivityFromStageId("m6-7-2-sign-rules")).toBe("g6-sign-rules");
    expect(integerAddSubtractActivityFromStageId("m6-7-2-add-model")).toBe("g6-add-model");
    expect(integerAddSubtractActivityFromStageId("m6-7-2-add-fractions")).toBe("g6-add-fractions");
    expect(integerMulDivActivityFromStageId("m6-7-3-integer-operations")).toBe("g6-integer-mul-div");
    expect(integerMulDivActivityFromStageId("m6-7-3-fraction-operations")).toBe("g6-fraction-mul-div");
    expect(integerMulDivActivityFromStageId("m6-7-3-decimal-operations")).toBe("g6-decimal-mul-div");
    expect(integerReviewActivityFromStageId("m6-7-4-order-natural")).toBe("g6-review-order-natural");
    expect(integerReviewActivityFromStageId("m6-7-4-order-fractions")).toBe("g6-review-order-fractions");
    expect(integerReviewActivityFromStageId("m6-7-4-escape")).toBe("g6-review-escape");
  });
});
