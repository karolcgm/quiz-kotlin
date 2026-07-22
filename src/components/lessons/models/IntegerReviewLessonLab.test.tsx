/** @vitest-environment jsdom */
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { IntegerReviewLessonLab, integerReviewActivityFromStageId } from "@/components/lessons/models/IntegerReviewLessonLab";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("IntegerReviewLessonLab", () => {
  it("prowadzi serię porównań od pierwszego zadania", () => {
    vi.useFakeTimers();
    render(<IntegerReviewLessonLab activity="comparison" />);

    expect(screen.getByText("Zadanie 1/6")).toBeInTheDocument();
    expect(screen.getByText((_, element) => element?.tagName === "P" && element.textContent?.includes("−8") === true && element.textContent?.includes("−3") === true)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "<" }));
    expect(screen.getByRole("status")).toHaveTextContent("Dobrze");
    act(() => vi.advanceTimersByTime(750));
    expect(screen.getByText("Zadanie 2/6")).toBeInTheDocument();
  });

  it("wymaga klawiatury lekcyjnej przy liczbach przeciwnych", () => {
    render(<IntegerReviewLessonLab activity="opposites" />);

    const answer = screen.getByLabelText("Liczba przeciwna");
    expect(answer).toHaveAttribute("inputmode", "none");
    expect(answer).toHaveAttribute("readonly");
    fireEvent.click(screen.getByRole("button", { name: "8" }));
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByRole("status")).toHaveTextContent("Dobrze");
  });

  it("wpisuje wybrany znak do kratki działania w zadaniu z treścią", () => {
    render(<IntegerReviewLessonLab activity="stories" />);

    const selectedOperator = screen.getByLabelText("Wybrany znak działania");
    expect(selectedOperator).toHaveTextContent("□");
    fireEvent.click(screen.getByRole("button", { name: "+" }));
    expect(selectedOperator).toHaveTextContent("+");
  });

  it("udostępnia cztery serie powtórzenia", () => {
    expect(integerReviewActivityFromStageId("m5-7-r-stacja-badawcza-v1-s1")).toBe("comparison");
    expect(integerReviewActivityFromStageId("m5-7-r-stacja-badawcza-v1-s2")).toBe("opposites");
    expect(integerReviewActivityFromStageId("m5-7-r-stacja-badawcza-v1-s3")).toBe("operations");
    expect(integerReviewActivityFromStageId("m5-7-r-stacja-badawcza-v1-s4")).toBe("stories");
  });
});
