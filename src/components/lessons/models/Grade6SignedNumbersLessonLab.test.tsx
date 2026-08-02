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

  it("zaczyna rachunki na liczbach całkowitych i wymaga osobnego znaku oraz wartości", () => {
    const onResultChange = vi.fn();
    render(<Grade6SignedNumbersLessonLab activity="g6-add-integers-same" taskSeed={0} questionNumber={1} questionCount={8} onResultChange={onResultChange} />);
    const input = screen.getByLabelText("Suma wartości bezwzględnych");
    expect(input).toHaveAttribute("inputmode", "none");
    expect(input).toHaveAttribute("readonly");
    fireEvent.click(screen.getByRole("button", { name: "−" }));
    fireEvent.click(input);
    fireEvent.click(screen.getByRole("button", { name: "7" }));
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByRole("status")).toHaveTextContent("Brawo!");
    expect(onResultChange).toHaveBeenLastCalledWith(true, expect.any(String));
  });

  it("nie pozwala zatwierdzić pustego warsztatu", () => {
    const onResultChange = vi.fn();
    render(<Grade6SignedNumbersLessonLab activity="g6-add-fractions" taskSeed={0} questionNumber={1} questionCount={6} onResultChange={onResultChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByRole("status")).toHaveTextContent("Uzupełnij wszystkie pola warsztatu");
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

  it("mapuje nowe etapy czterech tematów na właściwe aktywności", () => {
    expect(integerNumbersActivityFromStageId("m6-7-1-context-integers")).toBe("g6-context-integers");
    expect(integerNumbersActivityFromStageId("m6-7-1-rational-compare")).toBe("g6-rational-compare");
    expect(integerNumbersActivityFromStageId("m6-7-1-absolute-opposites")).toBe("g6-absolute-opposites");
    expect(integerAddSubtractActivityFromStageId("m6-7-2-add-integers-same")).toBe("g6-add-integers-same");
    expect(integerAddSubtractActivityFromStageId("m6-7-2-add-fractions")).toBe("g6-add-fractions");
    expect(integerMulDivActivityFromStageId("m6-7-3-multiply-integers")).toBe("g6-multiply-integers");
    expect(integerMulDivActivityFromStageId("m6-7-3-divide-fractions")).toBe("g6-divide-fractions");
    expect(integerReviewActivityFromStageId("m6-7-4-order-natural")).toBe("g6-review-order-natural");
    expect(integerReviewActivityFromStageId("m6-7-4-order-fractions")).toBe("g6-review-order-fractions");
    expect(integerReviewActivityFromStageId("m6-7-4-escape")).toBe("g6-review-escape");
  });
});
