/** @vitest-environment jsdom */
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Grade6SignedNumbersLessonLab } from "@/components/lessons/models/Grade6SignedNumbersLessonLab";
import { integerNumbersActivityFromStageId } from "@/components/lessons/models/IntegerNumbersLessonLab";
import { integerAddSubtractActivityFromStageId } from "@/components/lessons/models/IntegerAddSubtractLessonLab";
import { integerMulDivActivityFromStageId } from "@/components/lessons/models/IntegerMulDivLessonLab";
import { integerReviewActivityFromStageId } from "@/components/lessons/models/IntegerReviewLessonLab";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("Grade6SignedNumbersLessonLab", () => {
  it("prowadzi serię zadań o zbiorach liczb w jednym slajdzie", () => {
    vi.useFakeTimers();
    render(<Grade6SignedNumbersLessonLab activity="g6-number-sets" />);

    expect(screen.getByText("Zadanie 1/4")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "całkowite, ale nie naturalne" }));
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByText("Dobrze!")).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(500));
    expect(screen.getByText("Zadanie 2/4")).toBeInTheDocument();
  });

  it("blokuje klawiaturę urządzenia i przyjmuje wynik z klawiatury lekcyjnej", () => {
    render(<Grade6SignedNumbersLessonLab activity="g6-add-different" />);

    const input = screen.getByLabelText("Odpowiedź do zadania 1");
    expect(input).toHaveAttribute("inputmode", "none");
    expect(input).toHaveAttribute("readonly");

    fireEvent.click(input);
    fireEvent.click(screen.getByRole("button", { name: "1" }));
    fireEvent.click(screen.getByRole("button", { name: ", przecinek" }));
    fireEvent.click(screen.getByRole("button", { name: "4" }));
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByText("Dobrze!")).toBeInTheDocument();
  });

  it("po niepoprawnej odpowiedzi pokazuje neutralny komunikat i pozwala przejść bez punktu", () => {
    render(<Grade6SignedNumbersLessonLab activity="g6-number-sets" />);

    fireEvent.click(screen.getByRole("button", { name: "tylko naturalne" }));
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));

    expect(screen.getByText(/Spróbuj innym razem\. Poprawny wynik to/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Przejdź dalej bez punktu" })).toBeInTheDocument();
  });

  it("nie przenosi indeksu ani odpowiedzi między różnymi slajdami", () => {
    vi.useFakeTimers();
    const { rerender } = render(<Grade6SignedNumbersLessonLab activity="g6-number-sets" />);

    fireEvent.click(screen.getByRole("button", { name: "całkowite, ale nie naturalne" }));
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
    act(() => vi.advanceTimersByTime(500));
    expect(screen.getByText("Zadanie 2/4")).toBeInTheDocument();

    rerender(<Grade6SignedNumbersLessonLab activity="g6-compare" />);
    expect(screen.getByText("Zadanie 1/4")).toBeInTheDocument();
    expect(screen.getByText("−1,25 □ −1,2")).toBeInTheDocument();
  });

  it("pozwala nauczycielowi przechodzić między zadaniami bez udzielania odpowiedzi", () => {
    render(<Grade6SignedNumbersLessonLab activity="g6-number-sets" readOnly />);

    expect(screen.getByText("Zadanie 1/4")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Następne zadanie/ }));
    expect(screen.getByText("Zadanie 2/4")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Poprzednie zadanie/ }));
    expect(screen.getByText("Zadanie 1/4")).toBeInTheDocument();
  });

  it("wiąże etapy czterech tematów klasy 6 z właściwymi aktywnościami", () => {
    expect(integerNumbersActivityFromStageId("m6-7-1-number-sets")).toBe("g6-number-sets");
    expect(integerNumbersActivityFromStageId("m6-7-1-absolute-value")).toBe("g6-absolute-value");
    expect(integerNumbersActivityFromStageId("m6-7-1-number-line")).toBe("g6-number-line");
    expect(integerNumbersActivityFromStageId("m6-7-1-select")).toBe("g6-select");
    expect(integerNumbersActivityFromStageId("m6-7-1-compare")).toBe("g6-compare");
    expect(integerNumbersActivityFromStageId("m6-7-1-opposites")).toBe("g6-opposites");

    expect(integerAddSubtractActivityFromStageId("m6-7-2-sign-rules")).toBe("g6-sign-rules");
    expect(integerAddSubtractActivityFromStageId("m6-7-2-add-different")).toBe("g6-add-different");
    expect(integerAddSubtractActivityFromStageId("m6-7-2-add-same")).toBe("g6-add-same");
    expect(integerAddSubtractActivityFromStageId("m6-7-2-subtract")).toBe("g6-subtract");
    expect(integerAddSubtractActivityFromStageId("m6-7-2-axis")).toBe("g6-axis");
    expect(integerAddSubtractActivityFromStageId("m6-7-2-stories")).toBe("g6-add-stories");

    expect(integerMulDivActivityFromStageId("m6-7-3-sign-table")).toBe("g6-sign-table");
    expect(integerMulDivActivityFromStageId("m6-7-3-multiply")).toBe("g6-multiply");
    expect(integerMulDivActivityFromStageId("m6-7-3-divide")).toBe("g6-divide");
    expect(integerMulDivActivityFromStageId("m6-7-3-cipher")).toBe("g6-cipher");
    expect(integerMulDivActivityFromStageId("m6-7-3-stories")).toBe("g6-mul-stories");

    expect(integerReviewActivityFromStageId("m6-7-4-sets")).toBe("g6-review-sets");
    expect(integerReviewActivityFromStageId("m6-7-4-absolute")).toBe("g6-review-absolute");
    expect(integerReviewActivityFromStageId("m6-7-4-operations")).toBe("g6-review-operations");
    expect(integerReviewActivityFromStageId("m6-7-4-stories")).toBe("g6-review-stories");
    expect(integerReviewActivityFromStageId("m6-7-4-challenge")).toBe("g6-review-challenge");
  });
});
