/** @vitest-environment jsdom */
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ParallelogramAreaLab } from "@/components/lessons/area/ParallelogramAreaLab";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("ParallelogramAreaLab", () => {
  it("uczy wzoru i pokazuje wysokość prostopadłą do podstawy", () => {
    render(<ParallelogramAreaLab activity="area-formula" />);

    expect(screen.getByRole("heading", { name: "Wzór na pole równoległoboku" })).toBeInTheDocument();
    expect(screen.getByText("P = a · h")).toBeInTheDocument();
    expect(screen.getByText(/łuk z kropką/u)).toBeInTheDocument();
  });

  it("pozwala wybrać podstawę i dwa końce odpowiadającej wysokości", () => {
    vi.useFakeTimers();
    render(<ParallelogramAreaLab activity="base-height" />);

    expect(screen.getByText("Zadanie 1/6")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Wybierz odcinek AB jako podstawę" }));
    fireEvent.click(screen.getByRole("button", { name: "Wybierz punkt D" }));
    fireEvent.click(screen.getByRole("button", { name: "Wybierz punkt na prostej" }));
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź wskazanie" }));

    expect(screen.getByRole("status")).toHaveTextContent("Wysokość jest prostopadła");
    act(() => vi.advanceTimersByTime(750));
    expect(screen.getByText("Zadanie 2/6")).toBeInTheDocument();
  });

  it("prowadzi jedną serię obliczeń i blokuje klawiaturę systemową", () => {
    vi.useFakeTimers();
    render(<ParallelogramAreaLab activity="area-calculations" />);

    expect(screen.getByText("Zadanie 1/10")).toBeInTheDocument();
    const answer = screen.getByLabelText("Pole równoległoboku");
    expect(answer).toHaveAttribute("inputmode", "none");
    expect(answer).toHaveAttribute("readonly");

    fireEvent.click(screen.getByRole("button", { name: "2" }));
    fireEvent.click(screen.getByRole("button", { name: "8" }));
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByRole("status")).toHaveTextContent("Dobrze");

    act(() => vi.advanceTimersByTime(700));
    expect(screen.getByText("Zadanie 2/10")).toBeInTheDocument();
  });

  it("daje pusty szkicownik oraz miejsca na podpisanie podstawy i wysokości", () => {
    render(<ParallelogramAreaLab activity="area-stories" />);

    expect(screen.getByText("Zadanie 1/8")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Pusta kratownica do wykonania i podpisania szkicu" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Wstaw „a = 8 m”" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Wstaw „h = 3 m”" })).toBeInTheDocument();
    const answer = screen.getByLabelText("Pole kwietnika");
    expect(answer).toHaveAttribute("inputmode", "none");
    expect(answer).toHaveAttribute("readonly");
  });
});
