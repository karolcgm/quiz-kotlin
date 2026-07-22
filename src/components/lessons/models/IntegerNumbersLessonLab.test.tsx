/** @vitest-environment jsdom */
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  IntegerNumbersLessonLab,
  integerNumbersActivityFromStageId,
} from "@/components/lessons/models/IntegerNumbersLessonLab";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("IntegerNumbersLessonLab", () => {
  it("prowadzi kolejne pytania o liczby dodatnie, ujemne i zero na jednej karcie", () => {
    vi.useFakeTimers();
    render(<IntegerNumbersLessonLab activity="integer-introduction" />);

    expect(screen.getByText("Zadanie 1/4")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "liczbą ujemną" }));
    expect(screen.getByRole("status")).toHaveTextContent("Liczby ujemne");

    act(() => vi.advanceTimersByTime(850));
    expect(screen.getByText("Zadanie 2/4")).toBeInTheDocument();
    expect(screen.getByText(/ani dodatnią, ani ujemną/iu)).toBeInTheDocument();
  });

  it("używa tylko lekcyjnej klawiatury do wpisywania liczb przeciwnych", () => {
    render(<IntegerNumbersLessonLab activity="integer-opposites" />);

    const input = screen.getByLabelText("Liczba przeciwna do -7");
    expect(input).toHaveAttribute("inputmode", "none");
    expect(input).toHaveAttribute("readonly");
    fireEvent.click(input);
    fireEvent.click(screen.getByRole("button", { name: "−" }));
    fireEvent.click(screen.getByRole("button", { name: "7" }));
    expect(input).toHaveValue("-7");
  });

  it("pokazuje krokową animację ruchu po osi, która wyjaśnia zmianę liczby", () => {
    render(<IntegerNumbersLessonLab activity="integer-number-line" />);

    expect(screen.getByRole("region", { name: "Animacja ruchu po osi liczbowej" })).toBeInTheDocument();
    expect(screen.getByText("Krok 0/4 · teraz: -2")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Krok po kroku" }));
    expect(screen.getByText("Krok 1/4 · teraz: -1")).toBeInTheDocument();
  });

  it("pokazuje temperatury na wygenerowanej mapie Polski", () => {
    const { container } = render(<IntegerNumbersLessonLab activity="integer-temperatures" />);

    expect(screen.getByRole("img", { name: "Mapa Polski z zaznaczonymi temperaturami" })).toBeInTheDocument();
    expect(container.querySelector('img[src*="temperature-poland-map.png"]')).toBeInTheDocument();
  });

  it("po zmianie slajdu porównywania zawsze zaczyna od pierwszego zadania", () => {
    const { rerender } = render(<IntegerNumbersLessonLab activity="integer-number-line" />);

    rerender(<IntegerNumbersLessonLab activity="integer-compare" />);
    expect(screen.getByText("Zadanie 1/10")).toBeInTheDocument();
    expect(screen.getByText("−5 □ −2")).toBeInTheDocument();
  });

  it("pozwala wybrać liczbę mniejszą od zera po przejściu przez poprzednie zadania", () => {
    vi.useFakeTimers();
    render(<IntegerNumbersLessonLab activity="integer-number-line" />);

    fireEvent.click(screen.getByRole("button", { name: "−2" }));
    act(() => vi.advanceTimersByTime(850));
    fireEvent.click(screen.getByRole("button", { name: "−6" }));
    act(() => vi.advanceTimersByTime(850));
    fireEvent.click(screen.getByRole("button", { name: "2" }));
    act(() => vi.advanceTimersByTime(850));

    expect(screen.getByText("Która liczba jest mniejsza od 0?")).toBeInTheDocument();
    const answer = screen.getByRole("button", { name: "−4" });
    expect(answer).not.toBeDisabled();
    expect(answer).toHaveAttribute("type", "button");
    fireEvent.click(answer);
    expect(screen.getByRole("status")).toHaveTextContent("Wszystkie liczby ujemne");
  });

  it("wiąże sześć etapów pierwszej lekcji z sześcioma aktywnościami", () => {
    expect(integerNumbersActivityFromStageId("m5-7-1-liczby-ujemne-v1-s1")).toBe("integer-introduction");
    expect(integerNumbersActivityFromStageId("m5-7-1-liczby-ujemne-v1-s2")).toBe("integer-number-line");
    expect(integerNumbersActivityFromStageId("m5-7-1-liczby-ujemne-v1-s3")).toBe("integer-select");
    expect(integerNumbersActivityFromStageId("m5-7-1-liczby-ujemne-v1-s4")).toBe("integer-temperatures");
    expect(integerNumbersActivityFromStageId("m5-7-1-liczby-ujemne-v1-s5")).toBe("integer-compare");
    expect(integerNumbersActivityFromStageId("m5-7-1-liczby-ujemne-v1-s6")).toBe("integer-opposites");
  });
});
