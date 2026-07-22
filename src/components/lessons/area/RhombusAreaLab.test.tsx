/** @vitest-environment jsdom */
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RhombusAreaLab } from "@/components/lessons/area/RhombusAreaLab";
import { RHOMBUS_CALCULATION_TASKS } from "@/lib/math/area/rhombusArea";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("RhombusAreaLab", () => {
  it("pokazuje romb w dwóch ustawieniach", () => {
    render(<RhombusAreaLab activity="rhombus-shapes" />);

    expect(screen.getByRole("heading", { name: "Dwa ustawienia rombu" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Romb ustawiony jak równoległobok" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Romb ustawiony jak latawiec" })).toBeInTheDocument();
    expect(screen.getByText(/wszystkie cztery boki mają tę samą długość/u)).toBeInTheDocument();
  });

  it("pokazuje oba wzory wraz z właściwymi rysunkami", () => {
    render(<RhombusAreaLab activity="rhombus-formulas" />);

    expect(screen.getByRole("heading", { name: "Dwa wzory na pole rombu" })).toBeInTheDocument();
    expect(screen.getByText("P = a · h")).toBeInTheDocument();
    expect(screen.getByTestId("rhombus-diagonal-formula")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /Romb ustawiony jak równoległobok z wysokością/u })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /Romb ustawiony jak latawiec z przekątnymi/u })).toBeInTheDocument();
  });

  it("prowadzi jedną serię obliczeń, wymaga wyboru wzoru i blokuje klawiaturę systemową", () => {
    vi.useFakeTimers();
    render(<RhombusAreaLab activity="rhombus-calculations" />);

    expect(screen.getByText("Zadanie 1/12")).toBeInTheDocument();
    const answer = screen.getByLabelText("Pole rombu");
    expect(answer).toHaveAttribute("inputmode", "none");
    expect(answer).toHaveAttribute("readonly");

    fireEvent.click(screen.getByRole("button", { name: "P = a · h" }));
    fireEvent.click(screen.getByRole("button", { name: "3" }));
    fireEvent.click(screen.getByRole("button", { name: "6" }));
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByRole("status")).toHaveTextContent("9 · 4 = 36");

    act(() => vi.advanceTimersByTime(700));
    expect(screen.getByText("Zadanie 2/12")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "P = a · h" }));
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByRole("status")).toHaveTextContent("nie daje tutaj kompletu potrzebnych danych");
  });

  it("po zmianie serii zaczyna zadania tekstowe od zadania pierwszego", () => {
    const { rerender } = render(<RhombusAreaLab activity="rhombus-calculations" />);
    expect(screen.getByText("Zadanie 1/12")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Następne →" })).toBeDisabled();

    rerender(<RhombusAreaLab activity="rhombus-stories" />);
    expect(screen.getByText("Zadanie 1/8")).toBeInTheDocument();
    expect(screen.getByText(/Dekoracja w kształcie rombu/u)).toBeInTheDocument();
  });

  it("w zadaniu z pełnymi danymi wymaga obliczenia pola dwoma sposobami", () => {
    const task = RHOMBUS_CALCULATION_TASKS.find((item) => item.id === "both-methods");

    expect(task).toMatchObject({ requiresBothMethods: true });
    expect(task?.prompt).toContain("Oblicz pole na dwa sposoby");
    expect(task?.answerFields).toEqual([
      expect.objectContaining({ id: "area-base-height", answer: 60 }),
      expect.objectContaining({ id: "area-diagonals", answer: 60 }),
    ]);
  });
});
