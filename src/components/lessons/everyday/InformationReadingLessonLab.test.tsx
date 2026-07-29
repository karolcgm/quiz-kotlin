// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { InformationReadingLessonLab } from "@/components/lessons/everyday/InformationReadingLessonLab";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("InformationReadingLessonLab", () => {
  it("pokazuje te same dane w tabeli i na diagramie słupkowym", () => {
    render(<InformationReadingLessonLab activity="information-guide" />);
    expect(screen.getAllByText("Uczniowie na zajęciach")).toHaveLength(2);
    expect(screen.getByRole("figure", { name: /Diagram słupkowy/u })).toBeInTheDocument();
    expect(screen.getByText(/Tabela porządkuje dane/u)).toBeInTheDocument();
  });

  it("blokuje pustą odpowiedź i wyłącza klawiaturę urządzenia", () => {
    render(<InformationReadingLessonLab activity="table-reading" />);
    const input = screen.getByLabelText("Odpowiedź liczbowa");
    expect(input).toHaveAttribute("inputmode", "none");
    expect(input).toHaveAttribute("readonly");
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByText("Uzupełnij wynik przed zatwierdzeniem.")).toBeInTheDocument();
  });

  it("po poprawnym odczycie przechodzi do kolejnego zadania w tym samym slajdzie", () => {
    vi.useFakeTimers();
    render(<InformationReadingLessonLab activity="table-reading" />);
    fireEvent.click(screen.getByRole("button", { name: "6" }));
    fireEvent.click(screen.getByRole("button", { name: "3" }));
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByText(/Dobrze!/u)).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(700));
    expect(screen.getByText("Zadanie 2/6")).toBeInTheDocument();
  });

  it("pozwala zbudować diagram na podstawie tabeli", () => {
    render(<InformationReadingLessonLab activity="table-to-chart" />);
    const counts = [7, 4, 6, 3];
    const labels = ["Jabłko", "Banan", "Gruszka", "Śliwka"];
    labels.forEach((label, index) => {
      const button = screen.getByRole("button", { name: `Zwiększ słupek ${label}` });
      for (let click = 0; click < counts[index]!; click += 1) fireEvent.click(button);
    });
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź diagram" }));
    expect(screen.getByText("Dobrze! Diagram przedstawia wszystkie dane z tabeli.")).toBeInTheDocument();
  });

  it("po zmianie slajdu rozpoczyna serię od pierwszego zadania", () => {
    const view = render(<InformationReadingLessonLab slideId="tables-slide" activity="table-reading" readOnly />);
    const navigator = view.container.querySelector("[data-lesson-task-navigator]");
    expect(navigator).not.toBeNull();
    const next = navigator!.querySelectorAll("button")[1];
    for (let step = 0; step < 4; step += 1) fireEvent.click(next);
    expect(screen.getByText("Zadanie 5/6")).toBeInTheDocument();

    view.rerender(<InformationReadingLessonLab slideId="charts-slide" activity="bar-chart-reading" readOnly />);

    expect(screen.getByText("Zadanie 1/6")).toBeInTheDocument();
    const resetNavigator = view.container.querySelector("[data-lesson-task-navigator]");
    expect(resetNavigator?.querySelectorAll("button")[0]).toBeDisabled();
  });

  it("pozwala nauczycielowi przeglądać zadania w trybie interaktywnym", () => {
    const view = render(<InformationReadingLessonLab activity="table-reading" />);
    const navigator = view.container.querySelector("[data-lesson-task-navigator]");
    expect(navigator).not.toBeNull();
    const [previous, next] = Array.from(navigator!.querySelectorAll("button"));
    expect(previous).toBeDisabled();
    fireEvent.click(next);
    expect(screen.getByText("Zadanie 2/6")).toBeInTheDocument();
    expect(previous).not.toBeDisabled();
  });
});
