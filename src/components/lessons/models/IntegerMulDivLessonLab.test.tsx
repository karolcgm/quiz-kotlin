/** @vitest-environment jsdom */
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  IntegerMulDivLessonLab,
  integerMulDivActivityFromStageId,
} from "@/components/lessons/models/IntegerMulDivLessonLab";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("IntegerMulDivLessonLab", () => {
  it("zaczyna od tabeli znaków i przechodzi do następnego zadania na tym samym slajdzie", () => {
    vi.useFakeTimers();
    render(<IntegerMulDivLessonLab activity="sign-table" />);

    expect(screen.getByText("Zadanie 1/6")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "+" }));
    expect(screen.getByRole("status")).toHaveTextContent("Dobrze");
    act(() => vi.advanceTimersByTime(850));
    expect(screen.getByText("Zadanie 2/6")).toBeInTheDocument();
  });

  it("przy mnożeniu pozwala wpisać wynik wyłącznie klawiaturą lekcyjną", () => {
    render(<IntegerMulDivLessonLab activity="multiplication" />);

    const answer = screen.getByLabelText("Wynik działania −4 · 6");
    expect(answer).toHaveAttribute("inputmode", "none");
    expect(answer).toHaveAttribute("readonly");
    fireEvent.click(screen.getByRole("button", { name: "−" }));
    fireEvent.click(screen.getByRole("button", { name: "2" }));
    fireEvent.click(screen.getByRole("button", { name: "4" }));
    expect(answer).toHaveValue("-24");
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByRole("status")).toHaveTextContent("Dobrze");
  });

  it("w zadaniu tekstowym wymaga samodzielnego wpisania obu liczb i wyniku", () => {
    render(<IntegerMulDivLessonLab activity="stories" />);

    const first = screen.getByLabelText("Pierwsza liczba w działaniu");
    const second = screen.getByLabelText("Druga liczba w działaniu");
    const result = screen.getByLabelText("Wynik działania");
    for (const field of [first, second, result]) {
      expect(field).toHaveAttribute("inputmode", "none");
      expect(field).toHaveAttribute("readonly");
    }
    fireEvent.click(first);
    fireEvent.click(screen.getByRole("button", { name: "−" }));
    fireEvent.click(screen.getByRole("button", { name: "3" }));
    fireEvent.click(second);
    fireEvent.click(screen.getByRole("button", { name: "4" }));
    fireEvent.click(result);
    fireEvent.click(screen.getByRole("button", { name: "−" }));
    fireEvent.click(screen.getByRole("button", { name: "1" }));
    fireEvent.click(screen.getByRole("button", { name: "2" }));
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByRole("status")).toHaveTextContent("Dobrze");
  });

  it("rozpoznaje wszystkie pięć etapów tematu", () => {
    expect(integerMulDivActivityFromStageId("m5-7-4-wzorce-zmian-v1-s1")).toBe("sign-table");
    expect(integerMulDivActivityFromStageId("m5-7-4-wzorce-zmian-v1-s2")).toBe("multiplication");
    expect(integerMulDivActivityFromStageId("m5-7-4-wzorce-zmian-v1-s3")).toBe("division");
    expect(integerMulDivActivityFromStageId("m5-7-4-wzorce-zmian-v1-s4")).toBe("mixed");
    expect(integerMulDivActivityFromStageId("m5-7-4-wzorce-zmian-v1-s5")).toBe("stories");
  });
});
