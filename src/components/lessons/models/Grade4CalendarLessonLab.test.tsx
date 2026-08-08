/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Grade4CalendarLessonLab } from "@/components/lessons/models/Grade4CalendarLessonLab";

describe("Grade4CalendarLessonLab", () => {
  afterEach(cleanup);

  it("pokazuje miesiące, kwartały oraz poprawne długości lat", () => {
    render(<Grade4CalendarLessonLab activity="information" />);
    expect(screen.getByRole("heading", { name: "Kalendarz — miesiące i dni" })).toBeInTheDocument();
    expect(screen.getByText("luty")).toBeInTheDocument();
    cleanup();
    render(<Grade4CalendarLessonLab activity="quarter-leap" />);
    expect(screen.getByText("365 dni")).toBeInTheDocument();
    expect(screen.getByText("366 dni")).toBeInTheDocument();
    expect(screen.getByText("2024 — przestępny")).toBeInTheDocument();
  });

  it("blokuje klawiaturę urządzenia i zalicza zapis daty w trzech kratkach", () => {
    const onResultChange = vi.fn();
    render(<Grade4CalendarLessonLab activity="write-date" questionNumber={1} questionCount={5} onResultChange={onResultChange} />);
    const day = screen.getByLabelText("dzień");
    const month = screen.getByLabelText("miesiąc");
    const year = screen.getByLabelText("rok");
    for (const input of [day, month, year]) {
      expect(input).toHaveAttribute("inputmode", "none");
      expect(input).toHaveAttribute("readonly");
    }
    const keypad = screen.getByLabelText("Klawiatura do zapisywania daty");
    for (const digit of "11") fireEvent.click(within(keypad).getByRole("button", { name: digit }));
    fireEvent.click(month);
    for (const digit of "11") fireEvent.click(within(keypad).getByRole("button", { name: digit }));
    fireEvent.click(year);
    for (const digit of "2026") fireEvent.click(within(keypad).getByRole("button", { name: digit }));
    fireEvent.click(within(keypad).getByRole("button", { name: "Zatwierdź" }));
    expect(onResultChange).toHaveBeenLastCalledWith(true, "11.11.2026");
  });

  it("zalicza wiek dopiero po sprawdzeniu, czy urodziny już były", () => {
    const onResultChange = vi.fn();
    render(<Grade4CalendarLessonLab activity="age" questionNumber={2} questionCount={5} onResultChange={onResultChange} />);
    const input = screen.getByLabelText("Wiek w latach");
    expect(input).toHaveAttribute("inputmode", "none");
    expect(input).toHaveAttribute("readonly");
    const keypad = screen.getByLabelText("Klawiatura do obliczania wieku");
    for (const digit of "11") fireEvent.click(within(keypad).getByRole("button", { name: digit }));
    fireEvent.click(within(keypad).getByRole("button", { name: "Zatwierdź" }));
    expect(onResultChange).toHaveBeenLastCalledWith(true, "11");
  });

  it("zalicza dzień tygodnia po pełnych tygodniach i pozostałych dniach", () => {
    const onResultChange = vi.fn();
    render(<Grade4CalendarLessonLab activity="weekday" questionNumber={1} questionCount={5} onResultChange={onResultChange} />);
    fireEvent.click(screen.getByRole("button", { name: "czwartek" }));
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
    expect(onResultChange).toHaveBeenLastCalledWith(true, "czwartek");
  });

  it("pokazuje pełną ilustrację i zalicza datę przekraczającą granicę miesiąca", () => {
    const onResultChange = vi.fn();
    render(<Grade4CalendarLessonLab activity="story" questionNumber={1} questionCount={4} onResultChange={onResultChange} />);
    const image = screen.getByRole("img", { name: /letni obóz/u });
    expect(image).toHaveAttribute("src", expect.stringContaining("summer-camp.webp"));
    expect(image).toHaveClass("object-contain");
    const day = screen.getByLabelText("dzień");
    const month = screen.getByLabelText("miesiąc");
    const keypad = screen.getByLabelText("Klawiatura do zapisywania daty");
    fireEvent.click(within(keypad).getByRole("button", { name: "4" }));
    fireEvent.click(month);
    fireEvent.click(within(keypad).getByRole("button", { name: "7" }));
    fireEvent.click(within(keypad).getByRole("button", { name: "Zatwierdź" }));
    expect(day).toHaveAttribute("readonly");
    expect(month).toHaveAttribute("inputmode", "none");
    expect(onResultChange).toHaveBeenLastCalledWith(true, "4.7");
  });
});
