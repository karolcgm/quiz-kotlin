// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { PlaneFiguresReviewLessonLab } from "@/components/lessons/geometry/PlaneFiguresReviewLessonLab";
import {
  PLANE_FIGURES_REVIEW_ANGLE_TASKS,
  PLANE_FIGURES_REVIEW_CHALLENGE_TASKS,
  PLANE_FIGURES_REVIEW_LENGTH_TASKS,
} from "@/lib/math/geometry/planeFiguresReview";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("Powtórzenie figur na płaszczyźnie", () => {
  it("każde zadanie ma własną, niepowtarzającą się ilustrację", () => {
    const tasks = [
      ...PLANE_FIGURES_REVIEW_LENGTH_TASKS,
      ...PLANE_FIGURES_REVIEW_ANGLE_TASKS,
      ...PLANE_FIGURES_REVIEW_CHALLENGE_TASKS,
    ];
    const imageSources = tasks.map((task) => task.imageSrc);

    expect(new Set(imageSources).size).toBe(tasks.length);
  });

  it("blokuje puste zadanie i używa wyłącznie klawiatury lekcji", () => {
    const onResultChange = vi.fn();
    render(<PlaneFiguresReviewLessonLab activity="lengths" onResultChange={onResultChange} />);

    const input = screen.getByRole("textbox", { name: /długość ogrodzenia/i });
    expect(input).toHaveAttribute("inputmode", "none");
    expect(input).toHaveAttribute("readonly");

    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByRole("status")).toHaveTextContent("Uzupełnij wszystkie wymagane wyniki");
    expect(onResultChange).toHaveBeenLastCalledWith(null, "brak odpowiedzi");
  });

  it("po poprawnym wyniku przechodzi do kolejnego zadania w tej samej karcie", () => {
    vi.useFakeTimers();
    const onResultChange = vi.fn();
    render(<PlaneFiguresReviewLessonLab activity="lengths" onResultChange={onResultChange} />);

    fireEvent.click(screen.getByRole("textbox", { name: /długość ogrodzenia/i }));
    for (const digit of ["1", "4", "7"]) fireEvent.click(screen.getByRole("button", { name: digit }));
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));

    expect(screen.getByRole("status")).toHaveTextContent("Za chwilę pojawi się kolejne zadanie");
    act(() => vi.advanceTimersByTime(700));
    expect(screen.getByRole("img", { name: /trójkątny proporczyk przygotowany/i })).toBeInTheDocument();
    expect(screen.getByText((_, element) => element?.getAttribute("data-lesson-task-progress") === "true" && element.textContent === "Zadanie 2/6")).toBeInTheDocument();
    expect(onResultChange).not.toHaveBeenCalledWith(true, expect.anything());
  });
});
