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

  it("prowadzi jedną regułą: po uproszczeniu znaków uczeń wybiera znak i oblicza", () => {
    const onResultChange = vi.fn();
    render(<Grade6SignedNumbersLessonLab activity="g6-add-model" taskSeed={2} questionNumber={3} questionCount={8} onResultChange={onResultChange} />);
    const input = screen.getByLabelText("Wynik dodawania 4 + 3");
    expect(input).toHaveAttribute("inputmode", "none");
    expect(input).toHaveAttribute("readonly");
    fireEvent.click(screen.getByRole("button", { name: "−" }));
    fireEvent.click(input);
    fireEvent.click(screen.getByRole("button", { name: "7" }));
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByRole("status")).toHaveTextContent("Brawo!");
    expect(onResultChange).toHaveBeenLastCalledWith(true, expect.any(String));
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
    const { rerender } = render(<Grade6SignedNumbersLessonLab activity="g6-add-model" taskSeed={672096} questionNumber={1} questionCount={8} />);
    expect(screen.getAllByText("−6 + 1 = ?").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("−1")).toHaveLength(6);
    expect(screen.getAllByText("+1")).toHaveLength(1);
    fireEvent.click(screen.getByRole("button", { name: "Usuń następną parę zerową" }));
    expect(screen.getByRole("status")).toHaveTextContent("wynik to −5");

    rerender(<Grade6SignedNumbersLessonLab activity="g6-add-model" taskSeed={672097} questionNumber={2} questionCount={8} />);
    expect(screen.getAllByText("−3 + 5 = ?").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("−1")).toHaveLength(3);
    expect(screen.getAllByText("+1")).toHaveLength(5);
  });

  it("pokazuje ułamki jako pełny łańcuch po znaku równości i blokuje klawiaturę urządzenia", () => {
    const { container } = render(<Grade6SignedNumbersLessonLab activity="g6-add-fractions" taskSeed={2} questionNumber={3} questionCount={6} />);
    expect(screen.getByLabelText("Licznik: left")).toHaveAttribute("inputmode", "none");
    expect(screen.getByLabelText("Mianownik: result")).toHaveAttribute("readonly");
    expect(container.querySelectorAll("[data-stacked-fraction]").length).toBeGreaterThanOrEqual(2);
    expect(container.querySelectorAll("[data-fraction-equation-entry]")).toHaveLength(3);
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

  it("mapuje nowe etapy czterech tematów na właściwe aktywności", () => {
    expect(integerNumbersActivityFromStageId("m6-7-1-context-integers")).toBe("g6-context-integers");
    expect(integerNumbersActivityFromStageId("m6-7-1-rational-compare")).toBe("g6-rational-compare");
    expect(integerNumbersActivityFromStageId("m6-7-1-absolute-opposites")).toBe("g6-absolute-opposites");
    expect(integerAddSubtractActivityFromStageId("m6-7-2-sign-rules")).toBe("g6-sign-rules");
    expect(integerAddSubtractActivityFromStageId("m6-7-2-add-model")).toBe("g6-add-model");
    expect(integerAddSubtractActivityFromStageId("m6-7-2-add-fractions")).toBe("g6-add-fractions");
    expect(integerMulDivActivityFromStageId("m6-7-3-multiply-integers")).toBe("g6-multiply-integers");
    expect(integerMulDivActivityFromStageId("m6-7-3-divide-fractions")).toBe("g6-divide-fractions");
    expect(integerReviewActivityFromStageId("m6-7-4-order-natural")).toBe("g6-review-order-natural");
    expect(integerReviewActivityFromStageId("m6-7-4-order-fractions")).toBe("g6-review-order-fractions");
    expect(integerReviewActivityFromStageId("m6-7-4-escape")).toBe("g6-review-escape");
  });
});
