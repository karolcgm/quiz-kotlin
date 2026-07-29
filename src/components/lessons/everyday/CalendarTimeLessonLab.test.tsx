// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CalendarTimeLessonLab } from "@/components/lessons/everyday/CalendarTimeLessonLab";
import {
  CALENDAR_TASKS,
  CENTURY_TASKS,
  CONVERSION_TASKS,
  ELAPSED_TASKS,
  WEEKDAY_TASKS,
} from "@/lib/math/everyday/calendarTime";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("Kalendarz i czas", () => {
  it("nie powtarza poleceń między seriami", () => {
    const prompts = [
      ...CALENDAR_TASKS,
      ...CENTURY_TASKS,
      ...WEEKDAY_TASKS,
      ...CONVERSION_TASKS,
      ...ELAPSED_TASKS,
    ].map((task) => task.prompt);
    expect(new Set(prompts).size).toBe(prompts.length);
  });

  it("blokuje pustą odpowiedź wyboru", () => {
    const onResultChange = vi.fn();
    render(<CalendarTimeLessonLab activity="calendar" onResultChange={onResultChange} />);

    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByRole("status")).toHaveTextContent("Wybierz odpowiedź");
    expect(onResultChange).toHaveBeenLastCalledWith(null, "brak odpowiedzi");
  });

  it("po poprawnej odpowiedzi pokazuje kolejne zadanie w tej samej karcie", () => {
    vi.useFakeTimers();
    render(<CalendarTimeLessonLab activity="calendar" />);

    fireEvent.click(screen.getByRole("button", { name: "30" }));
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByRole("status")).toHaveTextContent("Dobrze");

    act(() => vi.advanceTimersByTime(650));
    expect(screen.getByRole("heading", { name: "Ile dni ma lipiec?" })).toBeInTheDocument();
    expect(screen.getByText((_, element) => element?.getAttribute("data-lesson-task-progress") === "true" && element.textContent === "Zadanie 2/6")).toBeInTheDocument();
  });

  it("pola liczbowe nie otwierają klawiatury urządzenia i korzystają z klawiatury lekcji", () => {
    render(<CalendarTimeLessonLab activity="conversions" />);
    const input = screen.getByRole("textbox", { name: "Razem" });

    expect(input).toHaveAttribute("inputmode", "none");
    expect(input).toHaveAttribute("readonly");
    for (const digit of ["1", "5", "5"]) fireEvent.click(screen.getByRole("button", { name: digit }));
    expect(input).toHaveValue("155");
  });

  it("nie przepuszcza nieuzupełnionego wyniku liczbowego", () => {
    const onResultChange = vi.fn();
    render(<CalendarTimeLessonLab activity="elapsed" onResultChange={onResultChange} />);

    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByRole("status")).toHaveTextContent("Uzupełnij wszystkie wyniki");
    expect(onResultChange).toHaveBeenLastCalledWith(null, "brak odpowiedzi");
  });
});
