/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Grade4ClockTimeLessonLab } from "@/components/lessons/models/Grade4ClockTimeLessonLab";

describe("Grade4ClockTimeLessonLab", () => {
  afterEach(cleanup);

  it("pokazuje oba zegary i wszystkie podstawowe zależności czasu", () => {
    render(<Grade4ClockTimeLessonLab activity="information" />);
    expect(screen.getByText("08:15")).toBeInTheDocument();
    expect(screen.getByText("1 min = 60 s")).toBeInTheDocument();
    expect(screen.getByText("kwadrans = 15 min")).toBeInTheDocument();
    expect(screen.getByText("1 doba = 24 h")).toBeInTheDocument();
  });

  it("odczytuje zegar w systemie 24-godzinnym i blokuje klawiaturę urządzenia", () => {
    const onResultChange = vi.fn();
    render(<Grade4ClockTimeLessonLab activity="read-clock" questionNumber={2} questionCount={5} onResultChange={onResultChange} />);
    const hour = screen.getByLabelText("godzina");
    const minutes = screen.getByLabelText("minuty");
    for (const input of [hour, minutes]) {
      expect(input).toHaveAttribute("inputmode", "none");
      expect(input).toHaveAttribute("readonly");
    }
    const keypad = screen.getByLabelText("Klawiatura do odczytywania zegara");
    for (const digit of "15") fireEvent.click(within(keypad).getByRole("button", { name: digit }));
    fireEvent.click(minutes);
    for (const digit of "15") fireEvent.click(within(keypad).getByRole("button", { name: digit }));
    fireEvent.click(within(keypad).getByRole("button", { name: "Zatwierdź" }));
    expect(onResultChange).toHaveBeenLastCalledWith(true, "15:15");
  });

  it("zalicza zamianę minut na sekundy przez klawiaturę lekcji", () => {
    const onResultChange = vi.fn();
    render(<Grade4ClockTimeLessonLab activity="convert" questionNumber={1} questionCount={6} onResultChange={onResultChange} />);
    const input = screen.getByLabelText("wynik w s");
    expect(input).toHaveAttribute("inputmode", "none");
    expect(input).toHaveAttribute("readonly");
    const keypad = screen.getByLabelText("Klawiatura do zamiany jednostek czasu");
    for (const digit of "180") fireEvent.click(within(keypad).getByRole("button", { name: digit }));
    fireEvent.click(within(keypad).getByRole("button", { name: "Zatwierdź" }));
    expect(onResultChange).toHaveBeenLastCalledWith(true, "180");
  });

  it("oblicza czas otwarcia w godzinach i minutach", () => {
    const onResultChange = vi.fn();
    render(<Grade4ClockTimeLessonLab activity="opening-hours" questionNumber={2} questionCount={6} onResultChange={onResultChange} />);
    expect(screen.getByText("9:30")).toBeInTheDocument();
    expect(screen.getByText("18:00")).toBeInTheDocument();
    const keypad = screen.getByLabelText("Klawiatura do obliczania czasu otwarcia");
    fireEvent.click(within(keypad).getByRole("button", { name: "8" }));
    fireEvent.click(screen.getByLabelText("minuty"));
    for (const digit of "30") fireEvent.click(within(keypad).getByRole("button", { name: digit }));
    fireEvent.click(within(keypad).getByRole("button", { name: "Zatwierdź" }));
    expect(onResultChange).toHaveBeenLastCalledWith(true, "8:30");
  });
});
