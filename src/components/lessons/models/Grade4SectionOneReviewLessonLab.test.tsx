/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Grade4SectionOneReviewLessonLab } from "@/components/lessons/models/Grade4SectionOneReviewLessonLab";

const typeNumber = (value: string) => { for (const digit of value) fireEvent.click(screen.getByRole("button", { name: digit })); };

describe("Grade4SectionOneReviewLessonLab", () => {
  afterEach(cleanup);

  it("pokazuje mapę wszystkich grup wiadomości z działu", () => {
    render(<Grade4SectionOneReviewLessonLab activity="map" />);
    expect(screen.getByText("Dodawanie i odejmowanie")).toBeInTheDocument();
    expect(screen.getByText("Mnożenie i dzielenie")).toBeInTheDocument();
    expect(screen.getByText("Reszta, potęgi i kolejność")).toBeInTheDocument();
    expect(screen.getByText("Treść zadania i oś")).toBeInTheDocument();
  });

  it("blokuje klawiaturę urządzenia i zalicza rachunek", () => {
    const onResultChange = vi.fn();
    render(<Grade4SectionOneReviewLessonLab activity="calculations" questionNumber={1} questionCount={5} onResultChange={onResultChange} />);
    const input = screen.getByLabelText("Wynik działania");
    expect(input).toHaveAttribute("inputmode", "none");
    expect(input).toHaveAttribute("readonly");
    typeNumber("95");
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
    expect(onResultChange).toHaveBeenLastCalledWith(true, "67 + 28 = 95");
  });

  it("w zadaniu z resztą wymaga całego zapisu i korzysta z klawiatury ekranowej", () => {
    const onResultChange = vi.fn();
    render(<Grade4SectionOneReviewLessonLab activity="stories" questionNumber={2} questionCount={2} onResultChange={onResultChange} />);
    const inputs = [
      screen.getByLabelText("Pierwsza liczba działania"),
      screen.getByLabelText("Druga liczba działania"),
      screen.getByLabelText("Liczba pełnych toreb"),
      screen.getByLabelText("Reszta z dzielenia"),
    ];
    for (const input of inputs) { expect(input).toHaveAttribute("inputmode", "none"); expect(input).toHaveAttribute("readonly"); }
    typeNumber("46");
    fireEvent.click(inputs[1]!); typeNumber("7");
    fireEvent.click(inputs[2]!); typeNumber("6");
    fireEvent.click(inputs[3]!); typeNumber("4");
    fireEvent.click(screen.getByRole("button", { name: ":" }));
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
    expect(onResultChange).toHaveBeenLastCalledWith(true, "46; 7; 6; 4");
  });

  it("zalicza wniosek wybrany po analizie treści", () => {
    const onResultChange = vi.fn();
    render(<Grade4SectionOneReviewLessonLab activity="analysis" questionNumber={1} questionCount={2} onResultChange={onResultChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Tak, w grupach 6, 6 i 5 osób." }));
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź odpowiedź" }));
    expect(onResultChange).toHaveBeenLastCalledWith(true, "Tak, w grupach 6, 6 i 5 osób.");
  });

  it("prowadzi przez trzy etapy kolejności działań", () => {
    const onResultChange = vi.fn();
    render(<Grade4SectionOneReviewLessonLab activity="order" questionNumber={1} questionCount={3} onResultChange={onResultChange} />);
    typeNumber("5");
    fireEvent.click(screen.getByLabelText("Potęga — wynik etapu")); typeNumber("9");
    fireEvent.click(screen.getByLabelText("Wynik — wynik etapu")); typeNumber("29");
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
    expect(onResultChange).toHaveBeenLastCalledWith(true, "5, 9, 29");
  });

  it("rysuje oś ze strzałką tylko po prawej stronie i odczytuje punkt", () => {
    const onResultChange = vi.fn();
    render(<Grade4SectionOneReviewLessonLab activity="axis" questionNumber={2} questionCount={3} onResultChange={onResultChange} />);
    expect(screen.getByLabelText("Oś liczbowa ze strzałką po prawej stronie i punktem A")).toBeInTheDocument();
    const input = screen.getByLabelText("Współrzędna punktu A");
    expect(input).toHaveAttribute("inputmode", "none");
    expect(input).toHaveAttribute("readonly");
    typeNumber("200");
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
    expect(onResultChange).toHaveBeenLastCalledWith(true, "A = 200");
  });
});
