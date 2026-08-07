/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Grade4StoryProblemsOneLessonLab } from "@/components/lessons/models/Grade4StoryProblemsOneLessonLab";

function pressDigits(value: string) {
  for (const digit of value) fireEvent.click(screen.getByRole("button", { name: digit }));
}

describe("Grade4StoryProblemsOneLessonLab", () => {
  afterEach(cleanup);
  it("przypomina na jednej historii różnicę między pytaniami o ile i ile razy", () => {
    render(<Grade4StoryProblemsOneLessonLab activity="information" />);

    expect(screen.getByAltText("Ola i Kuba porównują swoje kolekcje naklejek")).toBeInTheDocument();
    expect(screen.getByText("24 − 8 = 16")).toBeInTheDocument();
    expect(screen.getByText("24 : 8 = 3")).toBeInTheDocument();
    expect(screen.getByText(/„O ile więcej\?” lub „o ile mniej\?”/)).toHaveTextContent("odejmowanie");
    expect(screen.getByText(/„Ile razy więcej\?” lub „ile razy mniej\?”/)).toHaveTextContent("dzielenie");
  });

  it("blokuje klawiaturę urządzenia we wszystkich polach liczbowych", () => {
    render(<Grade4StoryProblemsOneLessonLab activity="practice" questionNumber={1} questionCount={4} />);

    expect(screen.getByAltText("Dwie grupy uczniów porównujące liczebność klas")).toBeInTheDocument();
    for (const input of screen.getAllByRole("textbox")) {
      expect(input).toHaveAttribute("inputmode", "none");
      expect(input).toHaveAttribute("readonly");
    }
    expect(screen.getByLabelText("Klawiatura do zapisu działania")).toBeInTheDocument();
  });

  it("zalicza całe poprawne działanie i pokazuje odpowiedź", () => {
    const onResultChange = vi.fn();
    render(<Grade4StoryProblemsOneLessonLab activity="practice" questionNumber={1} questionCount={4} onResultChange={onResultChange} />);

    pressDigits("35");
    fireEvent.click(screen.getByLabelText("Druga liczba działania"));
    pressDigits("27");
    fireEvent.click(screen.getByLabelText("Wynik działania"));
    pressDigits("8");
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));

    expect(onResultChange).toHaveBeenLastCalledWith(true, "35 − 27 = 8");
    expect(screen.getByRole("status")).toHaveTextContent("Brawo!");
    expect(screen.getByText(/W klasie IV A jest o/).closest("section")).toHaveTextContent("W klasie IV A jest o 8 uczniów więcej.");
  });

  it("nie pozwala zatwierdzić niepełnego działania", () => {
    const onResultChange = vi.fn();
    render(<Grade4StoryProblemsOneLessonLab activity="practice" questionNumber={2} questionCount={4} onResultChange={onResultChange} />);

    pressDigits("42");
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));

    expect(screen.getByRole("alert")).toHaveTextContent("Uzupełnij całe działanie.");
    expect(onResultChange).not.toHaveBeenCalledWith(expect.any(Boolean), expect.any(String));
  });

  it("po niepoprawnej odpowiedzi podaje wspierający komunikat i poprawny zapis", () => {
    const onResultChange = vi.fn();
    render(<Grade4StoryProblemsOneLessonLab activity="practice" questionNumber={3} questionCount={4} onResultChange={onResultChange} />);

    pressDigits("48");
    fireEvent.click(screen.getByLabelText("Druga liczba działania"));
    pressDigits("8");
    fireEvent.click(screen.getByLabelText("Wynik działania"));
    pressDigits("5");
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));

    expect(onResultChange).toHaveBeenLastCalledWith(false, "48 : 8 = 5");
    expect(screen.getByRole("status")).toHaveTextContent("Spróbuj innym razem. Poprawne działanie to 48 : 8 = 6. Dziś bez punktu.");
  });
});
