/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Grade4ReadingInformationOneLessonLab } from "@/components/lessons/models/Grade4ReadingInformationOneLessonLab";

describe("Grade4ReadingInformationOneLessonLab", () => {
  afterEach(cleanup);

  it("pokazuje przykład, który wymaga sprawdzenia warunków, a nie szukania działania", () => {
    render(<Grade4ReadingInformationOneLessonLab activity="information" />);

    expect(screen.getByText(/od 3 do 6 osób/)).toBeInTheDocument();
    expect(screen.getByText("Plansza 3: 2 osoby")).toBeInTheDocument();
    expect(screen.getByText("Za mało graczy")).toBeInTheDocument();
    expect(screen.getByText("Odpowiedź: Nie.")).toBeInTheDocument();
    expect(screen.getByText("1. Znajdź warunki")).toBeInTheDocument();
  });

  it("zalicza poprawny wniosek o pieniądzach bez pytania o dokładne kwoty", () => {
    const onResultChange = vi.fn();
    render(<Grade4ReadingInformationOneLessonLab activity="practice" questionNumber={1} questionCount={6} onResultChange={onResultChange} />);

    fireEvent.click(screen.getByRole("button", { name: "Adam" }));
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź odpowiedź" }));

    expect(onResultChange).toHaveBeenLastCalledWith(true, "Adam");
    expect(screen.getByRole("status")).toHaveTextContent("Kuba miał przewagę 20 zł i wydał tylko 12 zł");
  });

  it("prosi o wybranie odpowiedzi przed sprawdzeniem", () => {
    const onResultChange = vi.fn();
    render(<Grade4ReadingInformationOneLessonLab activity="practice" questionNumber={2} questionCount={6} onResultChange={onResultChange} />);

    fireEvent.click(screen.getByRole("button", { name: "Sprawdź odpowiedź" }));

    expect(screen.getByRole("alert")).toHaveTextContent("Wybierz jedną odpowiedź.");
    expect(onResultChange).not.toHaveBeenCalledWith(expect.any(Boolean), expect.any(String));
  });

  it("uczy wybierać brak możliwości ustalenia odpowiedzi", () => {
    const onResultChange = vi.fn();
    render(<Grade4ReadingInformationOneLessonLab activity="practice" questionNumber={6} questionCount={6} onResultChange={onResultChange} />);

    fireEvent.click(screen.getByRole("button", { name: "Nie można ustalić" }));
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź odpowiedź" }));

    expect(onResultChange).toHaveBeenLastCalledWith(true, "Nie można ustalić");
    expect(screen.getByRole("status")).toHaveTextContent("Nie podano żadnej temperatury.");
  });

  it("po nietrafnym wniosku pokazuje wspierający komunikat", () => {
    const onResultChange = vi.fn();
    render(<Grade4ReadingInformationOneLessonLab activity="practice" questionNumber={4} questionCount={6} onResultChange={onResultChange} />);

    fireEvent.click(screen.getByRole("button", { name: "Z czerwonego" }));
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź odpowiedź" }));

    expect(onResultChange).toHaveBeenLastCalledWith(false, "Z czerwonego");
    expect(screen.getByRole("status")).toHaveTextContent("Spróbuj innym razem. Poprawna odpowiedź to: Z niebieskiego. Dziś bez punktu.");
  });
});
